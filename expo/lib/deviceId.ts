import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'deckiq-device-id';

let cachedDeviceId: string | null = null;

/**
 * Returns a stable per-install identifier used for server-side rate limiting.
 */
export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;

  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) {
    cachedDeviceId = stored;
    return stored;
  }

  const generated = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  cachedDeviceId = generated;
  return generated;
}
