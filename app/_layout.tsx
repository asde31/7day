import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { ensurePermissions, setupChannels } from '@/lib/notifications';
import '@/lib/i18n';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Offline-first alarm setup: request notification permission and register
    // the high-importance Android channels on launch.
    ensurePermissions();
    setupChannels();
  }, []);

  useEffect(() => {
    // When an alarm notification is tapped, jump straight to the ring screen so
    // the mission must be completed to dismiss it.
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        alarmId?: string;
        kind?: string;
      };
      if (data?.kind === 'alarm' && data.alarmId) {
        router.push({ pathname: '/alarm/ring', params: { alarmId: data.alarmId } });
      }
    });
    return () => sub.remove();
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="alarm/new" options={{ presentation: 'modal' }} />
            <Stack.Screen
              name="alarm/ring"
              options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
            />
            <Stack.Screen name="breathing/[id]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="breathing/sos" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="nutrition/scan" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="nutrition/result" options={{ presentation: 'modal' }} />
            <Stack.Screen name="nutrition/profile" options={{ presentation: 'modal' }} />
            <Stack.Screen name="fitness/index" />
            <Stack.Screen name="fitness/[id]" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="fitness/admin" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
