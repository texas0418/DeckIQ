import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'FlashMind', headerLargeTitle: true }} />
      <Stack.Screen name="category" options={{ title: 'Category' }} />
    </Stack>
  );
}
