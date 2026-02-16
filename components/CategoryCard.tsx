import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { ChevronRight, Blocks, BookOpen, GraduationCap, FileCheck, Award } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Category } from '@/types/flashcard';

const iconMap: Record<string, React.ElementType> = {
  Blocks,
  BookOpen,
  GraduationCap,
  FileCheck,
  Award,
};

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export default React.memo(function CategoryCard({ category, onPress }: CategoryCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const IconComponent = iconMap[category.icon] || BookOpen;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
        testID={`category-card-${category.id}`}
      >
        <View style={[styles.iconContainer, { backgroundColor: category.color + '18' }]}>
          <IconComponent size={24} color={category.color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{category.title}</Text>
          <Text style={styles.subtitle}>{category.subtitle}</Text>
          <Text style={styles.count}>{category.subcategories.length} subjects</Text>
        </View>
        <ChevronRight size={20} color={Colors.textTertiary} />
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  count: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500' as const,
  },
});
