import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { colors } from '@/theme';
import { AnimatedSplash, GlobalOverlays } from '@/overlays';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootContent() {
  const { hydrated, splashReplayKey } = useApp();
  useEffect(() => { SplashScreen.hideAsync(); }, []);
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream }, animation: 'fade_from_bottom' }} />
      <AnimatedSplash key={splashReplayKey} ready={hydrated} />
      <GlobalOverlays />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootContent />
    </AppProvider>
  );
}
