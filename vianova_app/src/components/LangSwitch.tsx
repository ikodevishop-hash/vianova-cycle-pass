/** Compact language switcher used in headers and the login hero. */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SUPPORTED, setLang } from '../i18n';
import { C } from '../theme';

const SHORT: Record<string, string> = { ja: '日', en: 'EN', zh: '中', ko: '한' };

export function LangSwitch({ dark = false }: { dark?: boolean }) {
  const { i18n } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {SUPPORTED.map((lng) => {
        const active = i18n.language === lng;
        const border = active ? C.accent : dark ? 'rgba(255,255,255,.3)' : C.line;
        const fg = active ? '#fff' : dark ? 'rgba(255,255,255,.85)' : C.muted;
        return (
          <Pressable
            key={lng}
            onPress={() => setLang(lng)}
            hitSlop={6}
            style={{
              minWidth: 34,
              alignItems: 'center',
              paddingHorizontal: 9,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: active ? C.accent : 'transparent',
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <Text style={{ color: fg, fontSize: 12, fontWeight: '700' }}>{SHORT[lng]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
