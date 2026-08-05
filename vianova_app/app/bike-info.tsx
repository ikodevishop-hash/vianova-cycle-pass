import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../src/components/TopBar';
import { Card } from '../src/components/ui';
import { findBike, useDB } from '../src/store';
import { C } from '../src/theme';

/**
 * Per-bike terms & plan description (車種別 利用規約・プラン説明).
 * Content is set per bike in the master admin — separate from the global
 * login terms. Opened from the bike detail and certificate screens.
 */
export default function BikeInfo() {
  const { t } = useTranslation();
  const { bikeId } = useLocalSearchParams<{ bikeId: string }>();
  useDB();
  const bike = findBike(bikeId ?? '');
  const hasContent = !!(bike && (bike.planDesc || bike.bikeTerms));

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('bikeInfoTitle')} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {bike ? (
          <Text style={{ fontSize: 17, fontWeight: '700', color: C.ink, marginBottom: 12 }}>{bike.name}</Text>
        ) : null}

        {!hasContent ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Text style={{ fontSize: 46, opacity: 0.5 }}>📑</Text>
            <Text style={{ marginTop: 10, color: C.muted, fontSize: 14, textAlign: 'center' }}>
              {t('emptyBikeInfo')}
            </Text>
          </View>
        ) : (
          <>
            {bike?.planDesc ? (
              <Card style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.accentPress, marginBottom: 8 }}>
                  {t('sectionPlan')}
                </Text>
                <Text style={{ color: C.text, fontSize: 13.5, lineHeight: 23 }}>{bike.planDesc}</Text>
              </Card>
            ) : null}
            {bike?.bikeTerms ? (
              <Card>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.accentPress, marginBottom: 8 }}>
                  {t('sectionBikeTerms')}
                </Text>
                <Text style={{ color: C.muted, fontSize: 13, lineHeight: 23 }}>{bike.bikeTerms}</Text>
              </Card>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
