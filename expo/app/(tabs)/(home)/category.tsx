import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Sparkles, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { categories } from '@/mocks/categories';

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Category not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen options={{ title: category.title }} />

      <View style={[styles.headerCard, { backgroundColor: category.color + '12' }]}>
        <Text style={[styles.headerTitle, { color: category.color }]}>{category.title}</Text>
        <Text style={styles.headerSubtitle}>{category.subtitle}</Text>
        <Text style={styles.headerCount}>{category.subcategories.length} subjects available</Text>
      </View>

      <View style={styles.listContainer}>
        {category.subcategories.map((sub, index) => (
          <Pressable
            key={sub.id}
            style={[
              styles.subjectCard,
              index === category.subcategories.length - 1 && styles.lastCard,
            ]}
            onPress={() => router.push({
              pathname: '/(tabs)/create' as any,
              params: {
                topic: sub.title,
                category: category.id,
                subcategory: sub.id,
                description: sub.description,
              },
            })}
            testID={`subject-${sub.id}`}
          >
            <View style={styles.subjectContent}>
              <Text style={styles.subjectTitle}>{sub.title}</Text>
              <Text style={styles.subjectDescription}>{sub.description}</Text>
            </View>
            <View style={styles.subjectAction}>
              <Sparkles size={16} color={Colors.accent} />
              <ChevronRight size={18} color={Colors.textTertiary} />
            </View>
          </Pressable>
        ))}
      </View>
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
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  headerCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  headerCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  listContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  lastCard: {
    borderBottomWidth: 0,
  },
  subjectContent: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  subjectDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  subjectAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 12,
  },
});
