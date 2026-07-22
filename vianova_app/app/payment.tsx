import React, { useEffect, useRef, useState } from 'react';
import { AppState, Linking, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../src/components/TopBar';
import { Btn } from '../src/components/ui';
import { useToast } from '../src/components/toast';
import {
  cancelPayment,
  findBike,
  getDraft,
  getPaymentStatus,
  refreshAfterPayment,
  setDraft,
  startPayment,
} from '../src/store';
import { errKey } from '../src/api';
import { C, R } from '../src/theme';

/**
 * Payment screen — GMO リンクタイプPlus (hosted).
 *
 * The customer never types the card here. We ask the server to start payment:
 *  - mock mode → the rental is created immediately (demo).
 *  - GMO mode  → we open GMO's secure hosted page; the card + 3-D Secure happen
 *    there. On return we poll the server (fed by GMO's result notification) for
 *    the final status.
 */
export default function Payment() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();

  const draft = getDraft();
  const bike = draft ? findBike(draft.bikeId) : null;

  const [busy, setBusy] = useState(false); // starting / mock-finishing
  const [checking, setChecking] = useState(false); // polling status
  const [orderId, setOrderId] = useState<string | null>(null); // set once GMO page opened
  const finished = useRef(false);

  // No draft (deep-link / reload) → back to home.
  useEffect(() => {
    if (!draft) router.replace('/home');
  }, [draft, router]);

  const finish = (rentalId: string) => {
    finished.current = true;
    setDraft(null);
    void refreshAfterPayment();
    router.replace(`/success?rentalId=${rentalId}` as never);
  };

  const begin = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      const r = await startPayment(draft);
      if (r.mock && r.rental) {
        finish(r.rental.rentalId);
        return;
      }
      if (r.linkUrl && r.orderId) {
        setOrderId(r.orderId);
        await Linking.openURL(r.linkUrl);
        toast(t('payOpened'));
      } else {
        toast(t('errGeneric'));
      }
    } catch (e) {
      toast(t(errKey(e)));
    } finally {
      setBusy(false);
    }
  };

  const checkStatus = async (silent = false) => {
    if (!orderId || finished.current) return;
    setChecking(true);
    try {
      const s = await getPaymentStatus(orderId);
      if (s.paymentStatus === 'paid') {
        finish(s.rentalId);
      } else if (s.paymentStatus === 'failed') {
        setOrderId(null);
        toast(t('payIncomplete'));
      } else if (!silent) {
        toast(t('payIncomplete'));
      }
    } catch (e) {
      if (!silent) toast(t(errKey(e)));
    } finally {
      setChecking(false);
    }
  };

  // Auto-check when the app comes back to the foreground after the GMO page.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active' && orderId && !finished.current) void checkStatus(true);
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Release the held bike if the user leaves without paying (server ignores this
  // once the order is already paid).
  useEffect(() => {
    return () => {
      if (orderId && !finished.current) void cancelPayment(orderId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const isLease = bike?.productType === 'lease';

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('gmoTitle')} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Summary */}
        <View style={{ backgroundColor: '#fff', borderRadius: R.lg, borderWidth: 1, borderColor: C.line, padding: 18 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.muted, marginBottom: 12 }}>{t('paySummaryH')}</Text>
          <Row label={t('certBikename')} value={bike?.name ?? draft?.bikeId ?? ''} />
          <Row label={t('specPrice')} value={bike ? `¥${bike.priceMonthly.toLocaleString()} ${t('perMonthTax')}` : ''} />
          <Row label={t('applyHFallback')} value={isLease ? t('productLease') : t('productRental')} last />
        </View>

        {/* GMO hosted-payment card */}
        <View style={{ backgroundColor: '#0E2E33', borderRadius: R.lg, padding: 22, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>GMO PAYMENT</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,.15)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 }}>
              <Text style={{ color: '#fff', fontSize: 11 }}>{t('gmoSecure')}</Text>
            </View>
          </View>
          <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 12.5, marginBottom: 14 }}>{t('gmoLinktype')}</Text>

          {!orderId ? (
            <Btn title={t('payProceed')} onPress={begin} loading={busy} />
          ) : (
            <>
              <Text style={{ color: 'rgba(255,255,255,.9)', fontSize: 13, lineHeight: 20, marginBottom: 14 }}>
                {t('payOpened')}
              </Text>
              <Btn title={checking ? t('payChecking') : t('payCheckStatus')} onPress={() => checkStatus(false)} loading={checking} />
            </>
          )}

          <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 11.5, marginTop: 14, textAlign: 'center', lineHeight: 17 }}>
            {t('paySecureNote')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 9,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: C.line,
      }}
    >
      <Text style={{ color: C.muted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: C.text, fontSize: 14, fontWeight: '700', flexShrink: 1, textAlign: 'right', marginLeft: 12 }}>
        {value}
      </Text>
    </View>
  );
}
