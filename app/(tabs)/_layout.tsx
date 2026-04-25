import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from 'components/haptic-tab';
import { Colors } from 'constants/theme';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'hooks/use-color-scheme';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '기록',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="pencil" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chart"
        options={{
          title: '통계',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="pie-chart" color={color} />,
        }}
      />
    </Tabs>
  );
}
