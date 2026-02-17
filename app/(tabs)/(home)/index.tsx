import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, TrendingUp, Zap, ChevronDown, ChevronRight, Blocks, BookOpen, GraduationCap, FileCheck, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { categories, quickStudyTopics } from '@/mocks/categories';
import CategoryCard from '@/components/CategoryCard';
import { useFlashcards } from '@/contexts/FlashcardContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const sections = [
  {
    title: 'Elementary School',
    subtitle: 'Grades K-5',
    icon: 'Blocks',
    color: '#10B981',
    categoryIds: ['kindergarten', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5'],
  },
  {
    title: 'Middle School',
    subtitle: 'Grades 6-8',
    icon: 'BookOpen',
    color: '#3B82F6',
    categoryIds: ['grade6', 'grade7', 'grade8'],
  },
  {
    title: 'High School',
    subtitle: 'Grades 9-12',
    icon: 'GraduationCap',
    color: '#8B5CF6',
    categoryIds: ['grade9', 'grade10', 'grade11', 'grade12'],
  },
  {
    title: 'Standardized Tests',
    subtitle: 'SAT, ACT, GED & more',
    icon: 'FileCheck',
    color: '#F59E0B',
    categoryIds: ['sat', 'act', 'ged', 'clt', 'ap-exams', 'psat'],
  },
  {
    title: 'Graduate & Professional',
    subtitle: 'MCAT, LSAT, GRE & more',
    icon: 'Award',
    color: '#EF6461',
    categoryIds: ['mcat', 'lsat', 'gre', 'gmat', 'dat', 'nclex', 'bar', 'cpa'],
  },
];

const iconMap: Record<string, any> = {
  Blocks,
  BookOpen,
  GraduationCap,
  FileCheck,
  Award,
};

export default function HomeScreen() {
  const router = useRouter();
  const { totalDecks, totalSessions, totalCardsStudied } = useFlashcards();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleSection = (title: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === title ? null : title);
  };

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

        {sections.map((sec) => {
          const isExpanded = expandedSection === sec.title;
          const Icon = iconMap[sec.icon] || BookOpen;
          const sectionCategories = sec.categoryIds
            .map((id) => categories.find((c) => c.id === id))
            .filter(Boolean);

          return (
            <View key={sec.title} style={styles.accordionContainer}>
              <Pressable
                style={[styles.accordionHeader, { borderLeftColor: sec.color }]}
                onPress={() => toggleSection(sec.title)}
              >
                <View style={[styles.accordionIcon, { backgroundColor: sec.color + '18' }]}>
                  <Icon size={20} color={sec.color} />
                </View>
                <View style={styles.accordionTextContainer}>
                  <Text style={styles.accordionTitle}>{sec.title}</Text>
                  <Text style={styles.accordionSubtitle}>{sec.subtitle} · {sectionCategories.length} categories</Text>
                </View>
                {isExpanded ? (
                  <ChevronDown size={20} color={Colors.textTertiary} />
                ) : (
                  <ChevronRight size={20} color={Colors.textTertiary} />
                )}
              </Pressable>

              {isExpanded && (
                <View style={styles.accordionBody}>
                  {sectionCategories.map((category) => (
                    category && (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onPress={() => router.push({ pathname: '/(tabs)/(home)/category' as any, params: { categoryId: category.id } })}
                      />
                    )
                  ))}
                </View>
              )}
            </View>
          );
        })}
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
  // Accordion
  accordionContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  accordionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accordionTextContainer: {
    flex: 1,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  accordionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  accordionBody: {
    marginTop: 8,
    paddingLeft: 4,
  },
  bottomPadding: {
    height: 20,
  },
});
