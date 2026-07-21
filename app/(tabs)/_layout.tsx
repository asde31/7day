import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme/ThemeProvider';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 22, color }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <TabIcon emoji="☀️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="alarm"
        options={{
          title: t('tabs.alarm'),
          tabBarIcon: ({ color }) => <TabIcon emoji="⏰" color={color} />,
        }}
      />
      <Tabs.Screen
        name="water"
        options={{
          title: t('tabs.water'),
          tabBarIcon: ({ color }) => <TabIcon emoji="💧" color={color} />,
        }}
      />
      <Tabs.Screen
        name="breathing"
        options={{
          title: t('tabs.breathing'),
          tabBarIcon: ({ color }) => <TabIcon emoji="🌬️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}
