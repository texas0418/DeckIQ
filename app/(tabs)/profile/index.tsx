import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Brain, Target, Layers, TrendingUp, BookOpen, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useFlashcards } from '@/contexts/FlashcardContext';

export default function ProfileScreen() {
  const { totalDecks, totalSessions, totalCardsStudied, totalMastered, decks } = useFlashcards();

  const totalCards = decks.reduce((sum, d) => sum + d.cards.length, 0);
  const totalMasteredCards = decks.reduce((sum, d) => sum + d.cards.filter((c) => c.mastered).length, 0);
  const masteryRate = totalCards > 0 ? Math.round((totalMasteredCards / totalCards) * 100) : 0;

  const stats = [
    { icon: Layers, label: 'Total Decks', value: totalDecks.toString(), color: Colors.accent },
    { icon: BookOpen, label: 'Total Cards', value: totalCards.toString(), color: '#3B82F6' },
    { icon: Target, label: 'Cards Mastered', value: totalMasteredCards.toString(), color: Colors.amber },
    { icon: TrendingUp, label: 'Study Sessions', value: totalSessions.toString(), color: '#8B5CF6' },
    { icon: Brain, label: 'Cards Reviewed', value: totalCardsStudied.toString(), color: '#EC4899' },
    { icon: Award, label: 'Mastery Rate', value: `${masteryRate}%`, color: Colors.coral },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={['#1A2B4A', '#2D4A7A']}
        style={styles.headerCard}
      >
        <View style={styles.avatarContainer}>
          <Brain size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.headerTitle}>DeckIQ</Text>
        <Text style={styles.headerSubtitle}>Your Learning Journey</Text>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Study Statistics</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: stat.color + '18' }]}>
              <stat.icon size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {decks.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Decks</Text>
          <View style={styles.recentContainer}>
            {decks.slice(0, 5).map((deck) => {
              const mastered = deck.cards.filter((c) => c.mastered).length;
              const progress = deck.cards.length > 0 ? Math.round((mastered / deck.cards.length) * 100) : 0;
              return (
                <View key={deck.id} style={styles.recentItem}>
                  <View style={[styles.recentDot, { backgroundColor: deck.color }]} />
                  <View style={styles.recentContent}>
                    <Text style={styles.recentTitle} numberOfLines={1}>{deck.title}</Text>
                    <Text style={styles.recentSub}>{deck.cards.length} cards</Text>
                  </View>
                  <Text style={[styles.recentProgress, { color: deck.color }]}>{progress}%</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  headerCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    width: '47%' as const,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  recentContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  recentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  recentSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recentProgress: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  bottomPadding: {
    height: 20,
  },
});
