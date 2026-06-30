import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../src/components/TopBar';
import { Card } from '../src/components/ui';
import { myRentals, useDB } from '../src/store';
import { yen } from '../src/format';
import { C } from '../src/theme';

export default function Amount() {
  const { t } = useTranslation();
  useDB();
  const list = myRentals();
  const total = list.reduce((s, r) => s + (r.priceMonthly || 0), 0);
  const now = new Date();

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('amountTitle')} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {list.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Text style={{ fontSize: 46, opacity: 0.5 }}>💴</Text>
            <Text style={{ marginTop: 10, color: C.muted, fontSize: 14 }}>{t('emptyAmount')}</Text>
          </View>
        ) : (
          <>
            <Card style={{ alignItems: 'center', paddingVertical: 26 }}>
              <Text style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>
                {t('amountLabel', { y: now.getFullYear(), m: now.getMonth() + 1 })}
              </Text>
              <Text style={{ fontSize: 42, fontWeight: '700', color: C.ink }}>{yen(total)}</Text>
              <Text style={{ fontSize: 12, color: C.muted, marginTop: 8, textAlign: 'center' }}>{t('amountVia')}</Text>
            </Card>

            <Card style={{ marginTop: 14 }}>
              {list.map((r) => (
                <View
                  key={r.rentalId}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.line }}
                >
                  <Text style={{ color: C.ink, fontSize: 14 }}>{r.bikeName}</Text>
                  <Text style={{ color: C.ink, fontWeight: '600', fontSize: 14 }}>
                    {yen(r.priceMonthly)} {t('perMonth')}
                  </Text>
                </View>
              ))}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 }}>
                <Text style={{ color: C.ink, fontWeight: '700', fontSize: 15 }}>{t('amountTotal')}</Text>
                <Text style={{ color: C.accentPress, fontWeight: '700', fontSize: 15 }}>{yen(total)}</Text>
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}
