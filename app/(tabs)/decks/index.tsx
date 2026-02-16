import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Inbox } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFlashcards } from '@/contexts/FlashcardContext';
import DeckCard from '@/components/DeckCard';

export default function DecksScreen() {
  const { decks, isLoading } = useFlashcards();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading decks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {decks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Inbox size={48} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No decks yet</Text>
          <Text style={styles.emptySubtitle}>Create your first flashcard deck using AI or browse categories to get started</Text>
          <Pressable
            style={styles.createButton}
            onPress={() => router.push('/(tabs)/create' as any)}
            testID="empty-create-btn"
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Deck</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.deckCount}>
            <Text style={styles.deckCountText}>{decks.length} deck{decks.length !== 1 ? 's' : ''}</Text>
          </View>
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onPress={() => router.push({ pathname: '/deck/[deckId]' as any, params: { deckId: deck.id } })}
            />
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  deckCount: {
    marginBottom: 12,
  },
  deckCountText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  bottomPadding: {
    height: 20,
  },
});
