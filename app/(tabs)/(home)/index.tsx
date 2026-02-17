import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, TrendingUp, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { categories, quickStudyTopics } from '@/mocks/categories';
import CategoryCard from '@/components/CategoryCard';
import { useFlashcards } from '@/contexts/FlashcardContext';

export default function HomeScreen() {
  const router = useRouter();
  const { totalDecks, totalSessions, totalCardsStudied } = useFlashcards();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <LinearGradient
          colors={['#1A2B4A', '#2D4A7A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Study Smarter</Text>
            <Text style={styles.heroSubtitle}>AI-powered flashcards for every subject and test</Text>
            <Pressable
              style={styles.heroButton}
              onPress={() => router.push('/(tabs)/create' as any)}
              testID="hero-create-btn"
            >
              <Sparkles size={18} color={Colors.primary} />
              <Text style={styles.heroButtonText}>Generate Cards</Text>
            </Pressable>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalDecks}</Text>
              <Text style={styles.statLabel}>Decks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalCardsStudied}</Text>
              <Text style={styles.statLabel}>Cards</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Zap size={18} color={Colors.amber} />
          <Text style={styles.sectionTitle}>Quick Study</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickStudyContainer}>
          {quickStudyTopics.map((topic) => (
            <Pressable
              key={topic.id}
              style={styles.quickStudyChip}
              onPress={() => router.push({
                pathname: '/(tabs)/create' as any,
                params: { topic: topic.label, category: topic.category, subcategory: topic.subcategory },
              })}
              testID={`quick-study-${topic.id}`}
            >
              <Text style={styles.quickStudyText}>{topic.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={18} color={Colors.accent} />
          <Text style={styles.sectionTitle}>Browse by Level</Text>
        </View>
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onPress={() => router.push({ pathname: '/(tabs)/(home)/category' as any, params: { categoryId: category.id } })}
          />
        ))}
      </View>

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
    paddingTop: 8,
  },
  heroBanner: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  heroContent: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    marginBottom: 16,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.amber,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  quickStudyContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  quickStudyChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickStudyText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  bottomPadding: {
    height: 20,
  },
});
