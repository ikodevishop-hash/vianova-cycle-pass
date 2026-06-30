import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../src/components/TopBar';
import { Btn, Card } from '../src/components/ui';
import { getTerms, logout, useDB } from '../src/store';
import { C, R } from '../src/theme';

export default function Gate() {
  const { t } = useTranslation();
  const router = useRouter();
  const [agree, setAgree] = useState(false);
  useDB();

  const cancel = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('gateTitle')} onBack={cancel} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: C.ink }}>{t('gateH')}</Text>
        <Text style={{ color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 16 }}>{t('gateSub')}</Text>

        <View
          style={{
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.line,
            borderRadius: R.lg,
            padding: 16,
            maxHeight: 320,
          }}
        >
          <ScrollView nestedScrollEnabled>
            <Text style={{ color: C.muted, fontSize: 13, lineHeight: 23 }}>{getTerms()}</Text>
          </ScrollView>
        </View>

        <Card style={{ marginTop: 14 }}>
          <Pressable
            onPress={() => setAgree((v) => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <Ionicons
              name={agree ? 'checkbox' : 'square-outline'}
              size={24}
              color={agree ? C.accent : C.muted}
            />
            <Text style={{ flex: 1, fontSize: 13.5, color: C.text }}>{t('gateCheck')}</Text>
          </Pressable>
          <Btn
            title={t('gateGo')}
            disabled={!agree}
            onPress={() => router.replace('/home')}
            style={{ marginTop: 16 }}
          />
        </Card>
      </ScrollView>
    </View>
  );
}
