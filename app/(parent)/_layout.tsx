import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors, roundedFont } from '@/theme';

const icons = { index: 'grid', children: 'people', settings: 'options' } as const;

export default function ParentLayout() {
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      sceneStyle: { backgroundColor: colors.cream },
      tabBarActiveTintColor: colors.teal,
      tabBarInactiveTintColor: '#A4958C',
      tabBarStyle: { height: 72, paddingTop: 7, paddingBottom: 10, borderTopWidth: 0, backgroundColor: colors.white, elevation: 12 },
      tabBarLabelStyle: { fontSize: 11, ...roundedFont },
      tabBarIcon: ({ color, focused }) => <Ionicons name={icons[route.name as keyof typeof icons]} size={focused ? 25 : 22} color={String(color)} />,
      animation: 'shift',
    })}>
      <Tabs.Screen name="index" options={{ title: 'Familia' }} />
      <Tabs.Screen name="children" options={{ title: 'Actividad' }} />
      <Tabs.Screen name="settings" options={{ title: 'Controles' }} />
    </Tabs>
  );
}
