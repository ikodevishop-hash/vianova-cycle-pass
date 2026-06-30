import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn } from '../src/components/ui';
import { findRental } from '../src/store';
import { yen } from '../src/format';
import { C, R } from '../src/theme';

export default function Success() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { rentalId } = useLocalSearchParams<{ rentalId: string }>();
  const rental = findRental(rentalId ?? '');

  return (
    <View style={{ flex: 1, backgroundColor: C.paper, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            backgroundColor: C.accentPale,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
            marginBottom: 18,
          }}
        >
          <Ionicons name="checkmark" size={46} color={C.accent} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: C.ink }}>{t('successH')}</Text>
        <Text style={{ color: C.muted, fontSize: 13, marginTop: 6, textAlign: 'center' }}>{t('successSub')}</Text>

        <View
          style={{
            backgroundColor: '#fff',
            borderWidth: 1.5,
            borderColor: C.accent,
            borderStyle: 'dashed',
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 28,
            marginVertical: 16,
          }}
        >
          <Text style={{ fontSize: 30, fontWeight: '700', letterSpacing: 4, color: C.ink }}>
            {rentalId ?? '--------'}
          </Text>
        </View>

        {rental ? (
          <Text style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>
            {rental.bikeName} ／ {yen(rental.priceMonthly)} {t('perMonth')}
          </Text>
        ) : null}

        <View style={{ width: '100%', maxWidth: 360 }}>
          <Btn title={t('btnViewCert')} onPress={() => router.replace('/cert')} />
          <View style={{ height: 10 }} />
          <Btn title={t('btnToHome')} kind="ghost" onPress={() => router.replace('/home')} />
        </View>
      </ScrollView>
    </View>
  );
}
