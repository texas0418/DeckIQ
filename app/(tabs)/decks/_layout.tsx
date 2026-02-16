import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function DecksLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My Decks' }} />
    </Stack>
  );
}
