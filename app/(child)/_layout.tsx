import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors, roundedFont } from '@/theme';

const icons = { index: 'home', challenges: 'flag', pets: 'paw', accessories: 'bag-handle' } as const;

export default function ChildLayout() {
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      sceneStyle: { backgroundColor: colors.cream },
      tabBarActiveTintColor: colors.teal,
      tabBarInactiveTintColor: '#A4958C',
      tabBarHideOnKeyboard: true,
      tabBarStyle: { height: 72, paddingTop: 7, paddingBottom: 10, borderTopWidth: 0, backgroundColor: colors.white, elevation: 12 },
      tabBarLabelStyle: { fontSize: 11, ...roundedFont },
      tabBarIcon: ({ color, focused }) => <Ionicons name={icons[route.name as keyof typeof icons]} size={focused ? 25 : 22} color={String(color)} />,
      animation: 'shift',
    })}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="challenges" options={{ title: 'Retos' }} />
      <Tabs.Screen name="pets" options={{ title: 'Mascotas' }} />
      <Tabs.Screen name="accessories" options={{ title: 'Objetos' }} />
    </Tabs>
  );
}
