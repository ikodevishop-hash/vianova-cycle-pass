import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../src/components/TopBar';
import { Card, Badge } from '../src/components/ui';
import { myRentals, useDB } from '../src/store';
import { fmtDate, yen } from '../src/format';
import { C } from '../src/theme';

export default function Cert() {
  const { t } = useTranslation();
  useDB();
  const list = myRentals();

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('certTitle')} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {list.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Text style={{ fontSize: 46, opacity: 0.5 }}>📄</Text>
            <Text style={{ marginTop: 10, color: C.muted, fontSize: 14 }}>{t('emptyCert')}</Text>
          </View>
        ) : (
          list.map((r) => (
            <Card key={r.rentalId} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Badge text={t('badgeRenting')} bg={C.accent} />
                <Text style={{ fontWeight: '700', letterSpacing: 1, color: C.ink }}>{r.rentalId}</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.ink, marginVertical: 4 }}>{r.bikeName}</Text>
              <Row k={t('certStart')} v={fmtDate(r.startedAt)} />
              <Row k={t('certBikename')} v={r.bikeName} />
              <Row k={t('certSpec')} v={r.specShort || '—'} />
              <Row k={t('certPrice')} v={`${yen(r.priceMonthly)} ${t('perMonth')}`} />
              <Row k={t('certHolder')} v={r.customerName} last />
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
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
