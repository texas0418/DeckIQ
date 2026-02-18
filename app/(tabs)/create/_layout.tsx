import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function CreateLayout() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cameFromLink = !!params.topic;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Create Deck',
          headerLeft: cameFromLink
            ? () => (
                <Pressable onPress={() => router.back()} hitSlop={8}>
                  <ChevronLeft size={28} color={Colors.text} />
                </Pressable>
              )
            : undefined,
        }}
      />
    </Stack>
  );
}
