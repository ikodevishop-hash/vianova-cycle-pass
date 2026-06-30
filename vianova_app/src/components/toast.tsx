/** Lightweight global toast (mirrors the prototype's bottom pill). */
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { C } from '../theme';

const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (m: string) => {
      setMsg(m);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() =>
          setMsg(null),
        );
      }, 2200);
    },
    [opacity],
  );

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg != null && (
        <Animated.View pointerEvents="none" style={[st.toast, { opacity }]}>
          <Text style={st.text}>{msg}</Text>
        </Animated.View>
      )}
    </ToastCtx.Provider>
  );
}

const st = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    maxWidth: '88%',
    backgroundColor: C.ink,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  text: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
