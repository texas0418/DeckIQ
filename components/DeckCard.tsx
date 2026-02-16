import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Layers, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Deck } from '@/types/flashcard';

interface DeckCardProps {
  deck: Deck;
  onPress: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not studied yet';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default React.memo(function DeckCard({ deck, onPress }: DeckCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const mastered = deck.cards.filter((c) => c.mastered).length;
  const progress = deck.cards.length > 0 ? mastered / deck.cards.length : 0;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
        testID={`deck-card-${deck.id}`}
      >
        <View style={[styles.colorStripe, { backgroundColor: deck.color }]} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{deck.title}</Text>
            <View style={styles.cardCount}>
              <Layers size={14} color={Colors.textSecondary} />
              <Text style={styles.countText}>{deck.cards.length}</Text>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={1}>{deck.description}</Text>
          <View style={styles.footer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: deck.color }]} />
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.progressText}>{Math.round(progress * 100)}% mastered</Text>
              <View style={styles.timeRow}>
                <Clock size={12} color={Colors.textTertiary} />
                <Text style={styles.timeText}>{formatDate(deck.lastStudied)}</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  pressable: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  colorStripe: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  cardCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  footer: {
    gap: 6,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
});
