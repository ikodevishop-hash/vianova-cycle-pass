import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../../src/components/TopBar';
import { Btn, Card, Badge } from '../../src/components/ui';
import { findBike, useDB } from '../../src/store';
import { yen } from '../../src/format';
import { C, R } from '../../src/theme';

export default function BikeDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  useDB();
  const bike = findBike(id ?? '');

  if (!bike) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <TopBar title={t('detailTitle')} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('detailTitle')} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {bike.photos.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {bike.photos.map((p, i) => (
              <Image
                key={i}
                source={{ uri: p }}
                style={{ width: 280, height: 200, borderRadius: R.lg, marginRight: 8 }}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <View
            style={{
              height: 200,
              borderRadius: R.lg,
              backgroundColor: '#E4EDE9',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 64 }}>{bike.emoji}</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.ink }}>{bike.name}</Text>
          <Badge
            text={t(bike.productType === 'lease' ? 'productLease' : 'productRental')}
            bg={bike.productType === 'lease' ? C.ink2 : C.accent}
          />
        </View>
        <Text style={{ color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 12 }}>{bike.specShort}</Text>

        <Card>
          <Text style={{ fontSize: 34, fontWeight: '700', color: C.ink }}>
            {yen(bike.priceMonthly)}
            <Text style={{ fontSize: 15, color: C.muted, fontWeight: '600' }}> {t('perMonthTax')}</Text>
          </Text>
          <Text style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
            {t(bike.productType === 'lease' ? 'leaseNote' : 'maintIncluded')}
          </Text>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <SpecRow k={t('specFeature')} v={bike.specLong || bike.specShort || '—'} />
          <SpecRow k={t('labelColor')} v={bike.color || '—'} />
          <SpecRow k={t('specPrice')} v={`${yen(bike.priceMonthly)} ${t('perMonth')}`} last />
        </Card>

        {/* Per-bike terms & plan description set in the master admin. */}
        <Btn
          title={t('btnBikeInfo')}
          kind="ghost"
          onPress={() => router.push(`/bike-info?bikeId=${bike.id}` as never)}
          style={{ marginTop: 14 }}
        />

        <Btn
          title={t(bike.productType === 'lease' ? 'btnApplyLease' : 'btnApplyThis')}
          onPress={() => router.push(`/apply?bikeId=${bike.id}` as never)}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </View>
  );
}

function SpecRow({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 11,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: C.line,
      }}
    >
      <Text style={{ width: '38%', color: C.muted, fontSize: 14 }}>{k}</Text>
      <Text style={{ flex: 1, color: C.ink, fontWeight: '600', fontSize: 14 }}>{v}</Text>
    </View>
  );
}
