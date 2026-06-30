import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initI18n } from '../src/i18n';
import { hydrate } from '../src/store';
import { Loading } from '../src/components/ui';
import { ToastProvider } from '../src/components/toast';
import { C } from '../src/theme';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await Promise.all([initI18n(), hydrate()]);
      setReady(true);
    })();
  }, []);

  if (!ready) return <Loading />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: C.paper },
            }}
          />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
