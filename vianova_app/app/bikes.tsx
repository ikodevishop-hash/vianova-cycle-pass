import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../src/components/TopBar';
import { Badge } from '../src/components/ui';
import { useToast } from '../src/components/toast';
import { getBikes, myRentals, useDB } from '../src/store';
import { yen } from '../src/format';
import { C, R, shadow } from '../src/theme';

export default function Bikes() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const isLease = type === 'lease';
  useDB();

  const bikes = getBikes().filter((b) => b.productType === (isLease ? 'lease' : 'rental'));
  const rentedIds = myRentals().map((r) => r.bikeId);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={isLease ? t('leaseTitle') : t('bikesTitle')} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {bikes.length === 0 ? (
          <Empty icon={isLease ? '✨' : '🚲'} text={t(isLease ? 'emptyLease' : 'emptyBikes')} />
        ) : (
          bikes.map((b) => {
            const renting = rentedIds.includes(b.id);
            const soldOut = b.rented && !renting;
            const locked = renting || soldOut;
            return (
              <Pressable
                key={b.id}
                onPress={() => (locked ? toast(t('toastLocked')) : router.push(`/bike/${b.id}` as never))}
                style={[
                  {
                    flexDirection: 'row',
                    gap: 14,
                    backgroundColor: C.card,
                    borderWidth: 1,
                    borderColor: C.line,
                    borderRadius: R.lg,
                    overflow: 'hidden',
                    marginBottom: 14,
                    opacity: locked ? 0.6 : 1,
                  },
                  shadow,
                ]}
              >
                {b.photos[0] ? (
                  // contain: show the whole bike whatever the photo's aspect ratio is.
                  <Image
                    source={{ uri: b.photos[0] }}
                    style={{ width: 118, height: 110, backgroundColor: '#F2F5F3' }}
                    contentFit="contain"
                  />
                ) : (
                  <View style={{ width: 118, height: 110, backgroundColor: '#E4EDE9', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 40 }}>{b.emoji}</Text>
                  </View>
                )}
                <View style={{ flex: 1, paddingVertical: 13, paddingRight: 12 }}>
                  <Text style={{ fontSize: 15.5, fontWeight: '700', color: C.ink }}>{b.name}</Text>
                  <Text style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{b.specShort}</Text>
                  <Text style={{ marginTop: 8, fontWeight: '700', color: C.accentPress, fontSize: 14 }}>
                    {yen(b.priceMonthly)}
                    <Text style={{ color: C.muted, fontWeight: '500' }}> {t('perMonth')}</Text>
                  </Text>
                </View>
                {locked ? (
                  <View style={{ position: 'absolute', top: 10, right: 10 }}>
                    <Badge text={renting ? t('badgeRenting') : t('badgeSoldout')} />
                  </View>
                ) : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48 }}>
      <Text style={{ fontSize: 46, opacity: 0.5 }}>{icon}</Text>
      <Text style={{ marginTop: 10, color: C.muted, fontSize: 14, textAlign: 'center' }}>{text}</Text>
    </View>
  );
}
