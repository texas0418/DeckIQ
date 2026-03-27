import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { X, Check, RotateCcw, ChevronLeft, ChevronRight, Trophy } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useFlashcards } from '@/contexts/FlashcardContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StudyScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const { getDeck, updateCard, updateDeck, addStudyResult } = useFlashcards();
  const deck = getDeck(deckId ?? '');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredThisSession, setMasteredThisSession] = useState<Set<string>>(new Set());
  const [sessionComplete, setSessionComplete] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const flipCard = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  }, [isFlipped, flipAnim]);

  const animateTransition = useCallback((direction: 'left' | 'right', callback: () => void) => {
    const toX = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: toX, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === 'left' ? SCREEN_WIDTH : -SCREEN_WIDTH);
      scaleAnim.setValue(0.9);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    });
  }, [slideAnim, scaleAnim]);

  const goNext = useCallback(() => {
    if (!deck) return;
    if (isFlipped) {
      flipAnim.setValue(0);
      setIsFlipped(false);
    }
    if (currentIndex < deck.cards.length - 1) {
      animateTransition('left', () => setCurrentIndex((i) => i + 1));
    } else {
      finishSession();
    }
  }, [deck, currentIndex, isFlipped, flipAnim, animateTransition]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      if (isFlipped) {
        flipAnim.setValue(0);
        setIsFlipped(false);
      }
      animateTransition('right', () => setCurrentIndex((i) => i - 1));
    }
  }, [currentIndex, isFlipped, flipAnim, animateTransition]);

  const markMastered = useCallback(() => {
    if (!deck) return;
    const card = deck.cards[currentIndex];
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    updateCard(deck.id, card.id, { mastered: true });
    setMasteredThisSession((prev) => new Set(prev).add(card.id));
    goNext();
  }, [deck, currentIndex, updateCard, goNext]);

  const markNotMastered = useCallback(() => {
    if (!deck) return;
    const card = deck.cards[currentIndex];
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    updateCard(deck.id, card.id, { mastered: false });
    goNext();
  }, [deck, currentIndex, updateCard, goNext]);

  const finishSession = useCallback(() => {
    if (!deck) return;
    updateDeck(deck.id, {
      lastStudied: new Date().toISOString(),
      totalStudySessions: deck.totalStudySessions + 1,
    });
    addStudyResult({
      deckId: deck.id,
      totalCards: deck.cards.length,
      masteredCards: masteredThisSession.size,
      date: new Date().toISOString(),
    });
    setSessionComplete(true);
  }, [deck, masteredThisSession, updateDeck, addStudyResult]);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredThisSession(new Set());
    setSessionComplete(false);
    flipAnim.setValue(0);
    slideAnim.setValue(0);
  }, [flipAnim, slideAnim]);

  if (!deck) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>Deck not found</Text>
      </View>
    );
  }

  if (deck.cards.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>This deck has no cards</Text>
      </View>
    );
  }

  if (sessionComplete) {
    const masteredCount = masteredThisSession.size;
    const totalCount = deck.cards.length;
    const percentage = Math.round((masteredCount / totalCount) * 100);

    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={['#1A2B4A', '#2D4A7A']} style={styles.completionContainer}>
          <View style={styles.trophyContainer}>
            <Trophy size={48} color={Colors.amber} />
          </View>
          <Text style={styles.completionTitle}>Session Complete!</Text>
          <Text style={styles.completionSubtitle}>{deck.title}</Text>

          <View style={styles.completionStats}>
            <View style={styles.completionStatItem}>
              <Text style={styles.completionStatValue}>{totalCount}</Text>
              <Text style={styles.completionStatLabel}>Cards Reviewed</Text>
            </View>
            <View style={styles.completionStatDivider} />
            <View style={styles.completionStatItem}>
              <Text style={styles.completionStatValue}>{masteredCount}</Text>
              <Text style={styles.completionStatLabel}>Mastered</Text>
            </View>
            <View style={styles.completionStatDivider} />
            <View style={styles.completionStatItem}>
              <Text style={styles.completionStatValue}>{percentage}%</Text>
              <Text style={styles.completionStatLabel}>Score</Text>
            </View>
          </View>

          <View style={styles.completionActions}>
            <Pressable style={styles.restudyButton} onPress={resetSession}>
              <RotateCcw size={18} color={Colors.accent} />
              <Text style={styles.restudyText}>Study Again</Text>
            </Pressable>
            <Pressable style={styles.doneButton} onPress={() => router.back()}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const currentCard = deck.cards[currentIndex];
  const progress = (currentIndex + 1) / deck.cards.length;

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton} testID="study-close">
          <X size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{deck.title}</Text>
          <Text style={styles.headerCount}>{currentIndex + 1} / {deck.cards.length}</Text>
        </View>
        <View style={styles.closeButton} />
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: deck.color }]} />
        </View>
      </View>

      <View style={styles.cardContainer}>
        <Pressable onPress={flipCard} style={styles.cardPressable}>
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { translateX: slideAnim },
                  { scale: scaleAnim },
                  { perspective: 1000 },
                  { rotateY: frontInterpolate },
                ],
                backfaceVisibility: 'hidden',
                backgroundColor: Colors.surface,
              },
            ]}
          >
            <View style={[styles.cardLabel, { backgroundColor: deck.color + '18' }]}>
              <Text style={[styles.cardLabelText, { color: deck.color }]}>QUESTION</Text>
            </View>
            <Text style={styles.cardText}>{currentCard.front}</Text>
            <Text style={styles.tapHint}>Tap to flip</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                transform: [
                  { translateX: slideAnim },
                  { scale: scaleAnim },
                  { perspective: 1000 },
                  { rotateY: backInterpolate },
                ],
                backfaceVisibility: 'hidden',
                backgroundColor: Colors.surface,
              },
            ]}
          >
            <View style={[styles.cardLabel, { backgroundColor: Colors.accentLight }]}>
              <Text style={[styles.cardLabelText, { color: Colors.accent }]}>ANSWER</Text>
            </View>
            <Text style={styles.cardText}>{currentCard.back}</Text>
            <Text style={styles.tapHint}>Tap to flip back</Text>
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.controls}>
        <View style={styles.navRow}>
          <Pressable
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={goPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={24} color={currentIndex === 0 ? Colors.textTertiary : Colors.text} />
          </Pressable>

          <View style={styles.actionButtons}>
            <Pressable style={[styles.actionButton, styles.wrongButton]} onPress={markNotMastered} testID="mark-wrong">
              <X size={24} color={Colors.coral} />
              <Text style={[styles.actionLabel, { color: Colors.coral }]}>Still Learning</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.correctButton]} onPress={markMastered} testID="mark-correct">
              <Check size={24} color={Colors.accent} />
              <Text style={[styles.actionLabel, { color: Colors.accent }]}>Got It</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.navButton, currentIndex === deck.cards.length - 1 && styles.navButtonDisabled]}
            onPress={goNext}
            disabled={currentIndex === deck.cards.length - 1}
          >
            <ChevronRight size={24} color={currentIndex === deck.cards.length - 1 ? Colors.textTertiary : Colors.text} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  headerCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardPressable: {
    width: '100%',
    height: 340,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: 340,
    borderRadius: 24,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  cardLabel: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardLabelText: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 30,
  },
  tapHint: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    color: Colors.textTertiary,
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 4,
  },
  wrongButton: {
    backgroundColor: Colors.coralLight,
  },
  correctButton: {
    backgroundColor: Colors.accentLight,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  trophyContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(245,166,35,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 32,
  },
  completionStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    width: '100%',
    justifyContent: 'space-around',
  },
  completionStatItem: {
    alignItems: 'center',
  },
  completionStatValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  completionStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  completionStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  completionActions: {
    width: '100%',
    gap: 12,
  },
  restudyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  restudyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  doneButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
