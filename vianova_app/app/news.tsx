import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../src/components/TopBar';
import { Card } from '../src/components/ui';
import { myNews, useDB } from '../src/store';
import { C } from '../src/theme';

export default function News() {
  const { t } = useTranslation();
  useDB();
  const list = myNews();

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('newsTitle')} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {list.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Text style={{ fontSize: 46, opacity: 0.5 }}>📣</Text>
            <Text style={{ marginTop: 10, color: C.muted, fontSize: 14 }}>{t('emptyNews')}</Text>
          </View>
        ) : (
          list.map((n) => (
            <Card key={n.id} style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11.5, color: C.accentPress, fontWeight: '700', letterSpacing: 0.5 }}>
                {(n.date || '').replace(/-/g, '.')}
                {n.target ? ` ・ ${t('newsToYou')}` : ''}
              </Text>
              <Text style={{ fontSize: 15.5, fontWeight: '700', color: C.ink, marginVertical: 6 }}>{n.title}</Text>
              <Text style={{ fontSize: 13.5, color: C.muted, lineHeight: 21 }}>{n.body}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
