import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../src/components/TopBar';
import { getTerms, useDB } from '../src/store';
import { C, R } from '../src/theme';

export default function Terms() {
  const { t } = useTranslation();
  useDB();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('termsTitle')} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View
          style={{
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.line,
            borderRadius: R.lg,
            padding: 16,
          }}
        >
          <Text style={{ color: C.muted, fontSize: 13, lineHeight: 24 }}>{getTerms()}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
