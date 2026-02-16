import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Play, Trash2, Layers, Check, RotateCcw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFlashcards } from '@/contexts/FlashcardContext';

export default function DeckDetailScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const { getDeck, deleteDeck, updateCard } = useFlashcards();
  const deck = getDeck(deckId ?? '');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  if (!deck) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Deck' }} />
        <Text style={styles.errorText}>Deck not found</Text>
      </View>
    );
  }

  const mastered = deck.cards.filter((c) => c.mastered).length;
  const progress = deck.cards.length > 0 ? mastered / deck.cards.length : 0;

  const handleDelete = () => {
    Alert.alert(
      'Delete Deck',
      `Are you sure you want to delete "${deck.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteDeck(deck.id);
            router.back();
          },
        },
      ]
    );
  };

  const resetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Reset mastery progress for all cards in this deck?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            deck.cards.forEach((card) => {
              updateCard(deck.id, card.id, { mastered: false });
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: deck.title }} />
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { backgroundColor: deck.color + '12' }]}>
          <View style={[styles.colorDot, { backgroundColor: deck.color }]} />
          <Text style={styles.deckTitle}>{deck.title}</Text>
          <Text style={styles.deckDescription}>{deck.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Layers size={16} color={deck.color} />
              <Text style={styles.statBoxValue}>{deck.cards.length}</Text>
              <Text style={styles.statBoxLabel}>Cards</Text>
            </View>
            <View style={styles.statBox}>
              <Check size={16} color={Colors.accent} />
              <Text style={styles.statBoxValue}>{mastered}</Text>
              <Text style={styles.statBoxLabel}>Mastered</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statBoxValue, { color: deck.color }]}>{Math.round(progress * 100)}%</Text>
              <Text style={styles.statBoxLabel}>Progress</Text>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: deck.color }]} />
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.studyButton}
            onPress={() => router.push({ pathname: '/study/[deckId]' as any, params: { deckId: deck.id } })}
            testID="start-study"
          >
            <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.studyButtonText}>Start Studying</Text>
          </Pressable>
        </View>

        <View style={styles.secondaryActions}>
          <Pressable style={styles.secondaryButton} onPress={resetProgress}>
            <RotateCcw size={16} color={Colors.textSecondary} />
            <Text style={styles.secondaryButtonText}>Reset Progress</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleDelete}>
            <Trash2 size={16} color={Colors.coral} />
            <Text style={[styles.secondaryButtonText, { color: Colors.coral }]}>Delete Deck</Text>
          </Pressable>
        </View>

        <View style={styles.cardsSection}>
          <Text style={styles.cardsSectionTitle}>Cards ({deck.cards.length})</Text>
          {deck.cards.map((card, index) => (
            <CardItem
              key={card.id}
              index={index}
              front={card.front}
              back={card.back}
              mastered={card.mastered}
              expanded={expandedCard === card.id}
              onToggle={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
              color={deck.color}
            />
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

interface CardItemProps {
  index: number;
  front: string;
  back: string;
  mastered: boolean;
  expanded: boolean;
  onToggle: () => void;
  color: string;
}

const CardItem = React.memo(function CardItem({ index, front, back, mastered, expanded, onToggle, color }: CardItemProps) {
  const animHeight = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animHeight, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const maxHeight = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  return (
    <Pressable style={styles.cardItem} onPress={onToggle}>
      <View style={styles.cardItemHeader}>
        <View style={styles.cardItemLeft}>
          <Text style={styles.cardIndex}>#{index + 1}</Text>
          <Text style={styles.cardFrontText} numberOfLines={expanded ? undefined : 2}>{front}</Text>
        </View>
        {mastered && (
          <View style={[styles.masteredBadge, { backgroundColor: color + '18' }]}>
            <Check size={12} color={color} />
          </View>
        )}
      </View>
      <Animated.View style={[styles.cardBackContainer, { maxHeight, opacity: animHeight }]}>
        <View style={styles.cardDivider} />
        <Text style={styles.cardBackText}>{back}</Text>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  headerCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  deckTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  deckDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statBoxLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  actionRow: {
    marginBottom: 12,
  },
  studyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  studyButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  cardsSection: {
    gap: 10,
  },
  cardsSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  cardItem: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  cardItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardItemLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  cardIndex: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  cardFrontText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    lineHeight: 20,
  },
  masteredBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cardBackContainer: {
    overflow: 'hidden',
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  cardBackText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  bottomPadding: {
    height: 20,
  },
});
