// Właściciel: B (Jagoda). A dopisze tu ConnectionProvider i startConnection() — zadania A3/A5.
// TODO B1: czcionki, B3: opcje tras (menu jako transparentModal, drive bez gestu wstecz) i blokada pionu.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
        }}
      />
    </GestureHandlerRootView>
  );
}
