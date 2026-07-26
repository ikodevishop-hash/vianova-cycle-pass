import React from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../src/components/TopBar';
import { getTerms, useDB } from '../src/store';
import { getBaseUrl } from '../src/api';
import { C, R } from '../src/theme';

export default function Terms() {
  const { t } = useTranslation();
  useDB();
  const legal = (path: string) => Linking.openURL(`${getBaseUrl()}${path}`);
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

        {/* Legal pages (特商法表記 / プライバシーポリシー) — served by the API host. */}
        <View style={{ marginTop: 16, gap: 10 }}>
          <LegalLink label={t('legalTokushoho')} onPress={() => legal('/legal/tokushoho')} />
          <LegalLink label={t('legalPrivacy')} onPress={() => legal('/legal/privacy')} />
        </View>
      </ScrollView>
    </View>
  );
}

function LegalLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: pressed ? C.accent : C.line,
        borderRadius: R.md,
        paddingHorizontal: 14,
        paddingVertical: 13,
      })}
    >
      <Text style={{ color: C.ink, fontSize: 14, fontWeight: '600' }}>{label}</Text>
      <Ionicons name="open-outline" size={17} color="#BFCBC8" />
    </Pressable>
  );
}
