// Powered by OnSpace.AI
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const tabBarStyle = {
    height: Platform.select({
      ios: insets.bottom + 62,
      android: insets.bottom + 62,
      default: 70,
    }),
    paddingTop: 8,
    paddingBottom: Platform.select({
      ios: insets.bottom + 10,
      android: insets.bottom + 10,
      default: 10,
    }),
    paddingHorizontal: 4,
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: '#222222',
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: Colors.white,
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ملاكمة',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="sports-mma" size={size} color={color} />
          ),
          tabBarActiveTintColor: Colors.boxing,
        }}
      />
      <Tabs.Screen
        name="kickboxing"
        options={{
          title: 'كيك بوكسينغ',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="sports-kabaddi" size={size} color={color} />
          ),
          tabBarActiveTintColor: Colors.kickboxing,
        }}
      />
      <Tabs.Screen
        name="karate"
        options={{
          title: 'كاراتيه',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="sports-martial-arts" size={size} color={color} />
          ),
          tabBarActiveTintColor: Colors.karate,
        }}
      />
      <Tabs.Screen
        name="gymnastics"
        options={{
          title: 'جمباز',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="sports-gymnastics" size={size} color={color} />
          ),
          tabBarActiveTintColor: Colors.gymnastics,
        }}
      />
      <Tabs.Screen
        name="other-games"
        options={{
          title: 'ألعاب أخرى',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="sports-esports" size={size} color={color} />
          ),
          tabBarActiveTintColor: '#F97316',
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'التقارير',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bar-chart" size={size} color={color} />
          ),
          tabBarActiveTintColor: Colors.reports,
        }}
      />
    </Tabs>
  );
}
