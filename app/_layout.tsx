// Powered by OnSpace.AI
import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { GymProvider } from '@/contexts/GymContext';
import { TableGamesProvider } from '@/contexts/TableGamesContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <GymProvider>
          <TableGamesProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="filtered-members"
              options={{
                headerShown: false,
                animation: 'slide_from_left',
              }}
            />
          </Stack>
          </TableGamesProvider>
        </GymProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
