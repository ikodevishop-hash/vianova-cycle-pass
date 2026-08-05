/** Shared UI primitives — Vianova Cycle Pass design language. */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, shadow } from '../theme';

// Horizontal brand logo (white version for dark headers). Source: official
// vianova design PDF; aspect ratio 2124:444.
const LOGO_WHITE = require('../../assets/brand-logo-white.png');
const LOGO_ASPECT = 2124 / 444;

export function Btn({
  title,
  onPress,
  kind = 'primary',
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress?: () => void;
  kind?: 'primary' | 'ghost' | 'ink' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const bg =
    kind === 'primary' ? C.accent : kind === 'ink' ? C.ink : kind === 'danger' ? C.persimmon : 'transparent';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        st.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        kind === 'ghost' && { borderWidth: 1.5, borderColor: C.line },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={kind === 'ghost' ? C.ink : '#fff'} />
      ) : (
        <Text style={[st.btnText, kind === 'ghost' && { color: C.ink }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  hint,
  error,
  rightSlot,
  ...props
}: TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  rightSlot?: React.ReactNode;
}) {
  const isPassword = props.secureTextEntry === true;
  const [hidden, setHidden] = useState(true);
  const hasAccessory = isPassword || !!rightSlot;
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={st.label}>{label}</Text> : null}
      <View style={hasAccessory ? st.inputWrap : undefined}>
        <TextInput
          placeholderTextColor="#9aa6a2"
          {...props}
          secureTextEntry={isPassword ? hidden : props.secureTextEntry}
          style={[st.input, hasAccessory && st.inputFlex, props.style]}
        />
        {isPassword ? (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={10} style={st.accessory}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={21} color={C.ink2} />
          </Pressable>
        ) : (
          rightSlot
        )}
      </View>
      {hint ? <Text style={st.hint}>{hint}</Text> : null}
      {error ? <Text style={st.err}>{error}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[st.card, style]}>{children}</View>;
}

export function Badge({
  text,
  color = '#fff',
  bg = C.persimmon,
}: {
  text: string;
  color?: string;
  bg?: string;
}) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

export function Pill({ text }: { text: string }) {
  return (
    <View style={st.pill}>
      <Text style={st.pillText}>{text}</Text>
    </View>
  );
}

/** Horizontal brand logo (emblem + vianova script + CYCLE PASS). */
export function BrandLogo({ height = 34 }: { height?: number }) {
  return (
    <Image
      source={LOGO_WHITE}
      style={{ height, width: Math.round(height * LOGO_ASPECT) }}
      resizeMode="contain"
    />
  );
}

/** Brand glyph: rounded accent square with two small "wheels". */
export function BrandMark({ size = 34 }: { size?: number }) {
  const wheel = Math.round(size * 0.32);
  return (
    <View style={[st.mark, { width: size, height: size, borderRadius: size * 0.27 }]}>
      <View style={[st.wheel, { width: wheel, height: wheel, borderRadius: wheel / 2, left: size * 0.15 }]} />
      <View style={[st.wheel, { width: wheel, height: wheel, borderRadius: wheel / 2, right: size * 0.15 }]} />
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.paper }}>
      <ActivityIndicator size="large" color={C.accent} />
    </View>
  );
}

const st = StyleSheet.create({
  btn: {
    borderRadius: R.sm,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  btnText: { color: '#fff', fontSize: 15.5, fontWeight: '700', letterSpacing: 0.2 },
  label: { fontSize: 13, color: C.ink, marginBottom: 6, fontWeight: '700' },
  hint: { fontSize: 11.5, color: C.muted, marginTop: 5 },
  err: { fontSize: 12, color: C.persimmon, marginTop: 5, fontWeight: '600' },
  input: {
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.sm,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: C.text,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.sm,
    backgroundColor: '#fff',
  },
  inputFlex: { flex: 1, borderWidth: 0, backgroundColor: 'transparent' },
  accessory: { paddingHorizontal: 12 },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: 18,
    ...shadow,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(21,185,129,.2)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: { color: '#7DEABB', fontSize: 12, fontWeight: '700' },
  mark: { backgroundColor: C.accent, position: 'relative' },
  wheel: {
    position: 'absolute',
    bottom: '20%',
    borderWidth: 2.5,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
});
