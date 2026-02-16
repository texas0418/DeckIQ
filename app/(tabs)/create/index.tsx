import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sparkles, Layers, BookOpen, Hash } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { generateObject } from '@/lib/ai';
import { z } from 'zod';
import Colors from '@/constants/colors';
import { useFlashcards } from '@/contexts/FlashcardContext';
import { Deck } from '@/types/flashcard';

const cardColors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF6461', '#EC4899'];

const flashcardSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().describe('The question or term on the front of the flashcard'),
      back: z.string().describe('The answer or definition on the back of the flashcard'),
    })
  ),
});

export default function CreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ topic?: string; category?: string; subcategory?: string; description?: string }>();
  const { addDeck } = useFlashcards();

  const [topic, setTopic] = useState(params.topic ?? '');
  const [description, setDescription] = useState(params.description ?? '');
  const [numCards, setNumCards] = useState('10');
  const [selectedColor, setSelectedColor] = useState(cardColors[0]);

  useEffect(() => {
    if (params.topic) setTopic(params.topic);
    if (params.description) setDescription(params.description);
  }, [params.topic, params.description]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Generate ${numCards} flashcards for studying "${topic}". ${description ? `Focus on: ${description}.` : ''} Each card should have a clear question/term on the front and a concise, accurate answer/definition on the back. Make the cards educational, progressive in difficulty, and suitable for effective studying.`;

      console.log('[CreateScreen] Generating flashcards with prompt:', prompt);

      const result = await generateObject({
        messages: [{ role: 'user', content: prompt }],
        schema: flashcardSchema,
      });

      console.log('[CreateScreen] Generated cards:', result.cards.length);
      return result;
    },
    onSuccess: (data) => {
      const newDeck: Deck = {
        id: Date.now().toString(),
        title: topic,
        description: description || `AI-generated flashcards for ${topic}`,
        category: params.category ?? 'custom',
        subcategory: params.subcategory ?? 'custom',
        cards: data.cards.map((card, i) => ({
          id: `${Date.now()}-${i}`,
          front: card.front,
          back: card.back,
          mastered: false,
        })),
        createdAt: new Date().toISOString(),
        lastStudied: null,
        totalStudySessions: 0,
        color: selectedColor,
      };

      addDeck(newDeck);
      console.log('[CreateScreen] Deck created:', newDeck.id);
      router.push({ pathname: '/deck/[deckId]' as any, params: { deckId: newDeck.id } });
    },
    onError: (error) => {
      console.error('[CreateScreen] Generation error:', error);
      Alert.alert('Generation Failed', 'Could not generate flashcards. Please try again.');
    },
  });

  const canGenerate = topic.trim().length > 0 && !generateMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.aiIconContainer}>
            <Sparkles size={28} color={Colors.amber} />
          </View>
          <Text style={styles.headerTitle}>AI Flashcard Generator</Text>
          <Text style={styles.headerSubtitle}>Enter a topic and let AI create study-ready flashcards instantly</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <BookOpen size={16} color={Colors.textSecondary} />
              <Text style={styles.labelText}>Topic</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g., SAT Vocabulary, Cell Biology, US History..."
              placeholderTextColor={Colors.textTertiary}
              value={topic}
              onChangeText={setTopic}
              testID="topic-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Layers size={16} color={Colors.textSecondary} />
              <Text style={styles.labelText}>Description (optional)</Text>
            </View>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Add specific details, chapters, or focus areas..."
              placeholderTextColor={Colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              testID="description-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Hash size={16} color={Colors.textSecondary} />
              <Text style={styles.labelText}>Number of Cards</Text>
            </View>
            <View style={styles.numCardsContainer}>
              {['5', '10', '15', '20'].map((num) => (
                <Pressable
                  key={num}
                  style={[styles.numChip, numCards === num && styles.numChipActive]}
                  onPress={() => setNumCards(num)}
                  testID={`num-cards-${num}`}
                >
                  <Text style={[styles.numChipText, numCards === num && styles.numChipTextActive]}>{num}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.labelText}>Deck Color</Text>
            <View style={styles.colorsContainer}>
              {cardColors.map((color) => (
                <Pressable
                  key={color}
                  style={[styles.colorChip, { backgroundColor: color }, selectedColor === color && styles.colorChipActive]}
                  onPress={() => setSelectedColor(color)}
                  testID={`color-${color}`}
                />
              ))}
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.generateButton, !canGenerate && styles.generateButtonDisabled]}
          onPress={() => generateMutation.mutate()}
          disabled={!canGenerate}
          testID="generate-btn"
        >
          {generateMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Sparkles size={20} color="#FFFFFF" />
          )}
          <Text style={styles.generateButtonText}>
            {generateMutation.isPending ? 'Generating...' : 'Generate Flashcards'}
          </Text>
        </Pressable>

        {generateMutation.isPending && (
          <View style={styles.loadingHint}>
            <Text style={styles.loadingHintText}>AI is creating your flashcards. This may take a moment...</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  aiIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: Colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    gap: 20,
    marginBottom: 28,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  numCardsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  numChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  numChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  numChipText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  numChipTextActive: {
    color: '#FFFFFF',
  },
  colorsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  colorChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorChipActive: {
    borderWidth: 3,
    borderColor: Colors.text,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  loadingHint: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadingHintText: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
