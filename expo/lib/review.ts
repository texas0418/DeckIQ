// lib/review.ts
// One polite App Store review ask, at the earned-value moment: the user has
// just finished a study session (reached the completion summary after the
// last card). Never mid-session. Eligible from the 3rd completed study
// session onward; asks at most once ever (AsyncStorage flag; Apple further
// rate-limits on their side).
// Fail-open: if the native module is missing or throws, nothing happens.

import AsyncStorage from '@react-native-async-storage/async-storage';

const ASKED_KEY = 'deckiq.review.asked.v1';
const SESSIONS_KEY = 'deckiq.review.sessionsCompleted.v1';

function getStoreReview(): any | null {
  // Do NOT rely on try/catch around require() for fail-open here: when a
  // module's factory throws (native half missing from the binary), Metro's
  // guardedLoadModule reports it as a FATAL error itself — the exception
  // never reaches this catch, and a release build aborts. This bricked
  // Number Nine's 2026-07-27 device build the first night the trigger fired.
  // Check the native registry BEFORE requiring so the factory can't throw.
  const native = (globalThis as any).expo?.modules?.ExpoStoreReview;
  if (!native) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-store-review');
    return mod?.default ?? mod ?? null;
  } catch {
    return null;
  }
}

/** Record one completed study session; on the 3rd or later, request a review
 *  if never asked before. Fire-and-forget and fail-open, safe to call often. */
export function recordStudySessionCompleted(): void {
  countAndMaybeAsk().catch(() => {
    /* fail open */
  });
}

async function countAndMaybeAsk(): Promise<void> {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
  const count = (Number.parseInt(raw ?? '0', 10) || 0) + 1;
  await AsyncStorage.setItem(SESSIONS_KEY, String(count));
  if (count < 3) return;
  if (await AsyncStorage.getItem(ASKED_KEY)) return;
  const SR = getStoreReview();
  if (!SR) return;
  await AsyncStorage.setItem(ASKED_KEY, String(Date.now()));
  // isAvailableAsync + requestReview both resolve quietly; the OS decides
  // whether anything is actually shown.
  const ok = await SR.isAvailableAsync?.();
  if (ok) await SR.requestReview?.();
}
