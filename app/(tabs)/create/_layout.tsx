import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function CreateLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Create Deck' }} />
    </Stack>
  );
}
