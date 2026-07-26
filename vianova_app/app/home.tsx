import React, { useEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../src/components/TopBar';
import { LangSwitch } from '../src/components/LangSwitch';
import { currentUser, logout, reload, useDB } from '../src/store';
import { C, R, shadow } from '../src/theme';

type MenuKey = 'bikes' | 'lease' | 'cert' | 'amount' | 'news' | 'terms' | 'account';
const MENU: { key: MenuKey; href: string; icon: string; tKey: string; sKey: string }[] = [
  { key: 'bikes', href: '/bikes', icon: '🚲', tKey: 'mBikesT', sKey: 'mBikesS' },
  { key: 'lease', href: '/bikes?type=lease', icon: '✨', tKey: 'mLeaseT', sKey: 'mLeaseS' },
  { key: 'cert', href: '/cert', icon: '📄', tKey: 'mCertT', sKey: 'mCertS' },
  { key: 'amount', href: '/amount', icon: '💴', tKey: 'mAmtT', sKey: 'mAmtS' },
  { key: 'news', href: '/news', icon: '📣', tKey: 'mNewsT', sKey: 'mNewsS' },
  { key: 'terms', href: '/terms', icon: '📑', tKey: 'mTermsT', sKey: 'mTermsS' },
  { key: 'account', href: '/account', icon: '👤', tKey: 'mAccountT', sKey: 'mAccountS' },
];

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  useDB();
  const user = currentUser();

  // Refresh bikes/news/rentals when landing on home (e.g. admin pushed news).
  useEffect(() => {
    reload();
  }, []);

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

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar
        brand
        back={false}
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <LangSwitch dark />
            <Pressable onPress={confirmLogout} hitSlop={8}>
              <Ionicons name="exit-outline" size={24} color="#fff" />
            </Pressable>
          </View>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: C.ink }}>
          {user ? t('homeHello', { id: user.memberId }) : t('loginH')}
        </Text>
        <Text style={{ color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 18 }}>{t('homeSub')}</Text>

        <View style={{ gap: 12 }}>
          {MENU.map((m) => (
            <Pressable
              key={m.key}
              onPress={() => router.push(m.href as never)}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  backgroundColor: C.card,
                  borderWidth: 1,
                  borderColor: pressed ? C.accent : C.line,
                  borderRadius: R.lg,
                  padding: 16,
                },
                shadow,
              ]}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: C.accentPale,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 21 }}>{m.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15.5, fontWeight: '700', color: C.ink }}>{t(m.tKey)}</Text>
                <Text style={{ color: C.muted, fontSize: 12.5, marginTop: 2 }}>{t(m.sKey)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#BFCBC8" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
