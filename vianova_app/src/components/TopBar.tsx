/** Dark sticky top bar (ports the prototype's `.topbar`). */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import { LangSwitch } from './LangSwitch';
import { BrandMark } from './ui';

export function TopBar({
  title,
  brand = false,
  back = true,
  right,
  onBack,
}: {
  title?: string;
  brand?: boolean;
  back?: boolean;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={{ backgroundColor: C.ink, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 14,
          minHeight: 56,
        }}
      >
        {back ? (
          <Pressable
            onPress={onBack ?? (() => router.back())}
            hitSlop={8}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: 'rgba(255,255,255,.14)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
        ) : null}

        {brand ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <BrandMark size={30} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Vianova</Text>
          </View>
        ) : (
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }} numberOfLines={1}>
            {title}
          </Text>
        )}

        <View style={{ flex: 1 }} />
        {right ?? <LangSwitch dark />}
      </View>
    </View>
  );
}
