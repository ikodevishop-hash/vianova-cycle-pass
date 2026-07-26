import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../src/components/TopBar';
import { Btn } from '../src/components/ui';
import { useToast } from '../src/components/toast';
import { currentUser, deleteAccount, logout, useDB } from '../src/store';
import { errKey } from '../src/api';
import { C, R } from '../src/theme';

/** Account screen — member info, logout, and account deletion (退会). */
export default function Account() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  useDB();
  const user = currentUser();
  const [busy, setBusy] = useState(false);

  const confirmLogout = () => {
    Alert.alert('', t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const confirmWithdraw = () => {
    Alert.alert(t('withdrawH'), t('withdrawConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('btnWithdraw'),
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await deleteAccount();
            toast(t('withdrawDone'));
            router.replace('/login');
          } catch (e) {
            toast(t(errKey(e)));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('accountTitle')} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Member info */}
        <View style={{ backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.line, padding: 18 }}>
          <Row label={t('labelId')} value={user?.memberId ?? ''} />
          <Row label={t('labelEmail')} value={user?.email ?? ''} last />
        </View>

        <Btn title={t('logout')} kind="ghost" onPress={confirmLogout} style={{ marginTop: 16 }} />

        {/* Danger zone: account deletion */}
        <View
          style={{
            backgroundColor: C.persimmonPale,
            borderRadius: R.lg,
            borderWidth: 1,
            borderColor: '#F2C4B4',
            padding: 18,
            marginTop: 28,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.persimmon }}>{t('withdrawH')}</Text>
          <Text style={{ color: C.text, fontSize: 12.5, lineHeight: 19, marginTop: 8, marginBottom: 14 }}>
            {t('withdrawNote')}
          </Text>
          <Btn title={t('btnWithdraw')} kind="danger" onPress={confirmWithdraw} loading={busy} />
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
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: C.line,
      }}
    >
      <Text style={{ color: C.muted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: C.text, fontSize: 14.5, fontWeight: '700', flexShrink: 1, textAlign: 'right', marginLeft: 12 }}>
        {value}
      </Text>
    </View>
  );
}
