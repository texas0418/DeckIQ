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
import { Sparkles, Layers, BookOpen, Hash, Plus, Trash2, PenLine } from 'lucide-react-native';
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

type ManualCard = { id: string; front: string; back: string };

export default function CreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ topic?: string; category?: string; subcategory?: string; description?: string }>();
  const { addDeck } = useFlashcards();

  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [topic, setTopic] = useState(params.topic ?? '');
  const [description, setDescription] = useState(params.description ?? '');
  const [numCards, setNumCards] = useState('10');
  const [selectedColor, setSelectedColor] = useState(cardColors[0]);

  // Manual mode state
  const [manualTitle, setManualTitle] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualCards, setManualCards] = useState<ManualCard[]>([
    { id: '1', front: '', back: '' },
  ]);

  useEffect(() => {
    if (params.topic) setTopic(params.topic);
    if (params.description) setDescription(params.description);
  }, [params.topic, params.description]);

  // --- AI Generation ---
  const generateMutation = useMutation({
    mutationFn: async () => {
      const count = parseInt(numCards, 10);
      if (isNaN(count) || count < 1) {
        throw new Error('Please enter a valid number of cards.');
      }
      if (count > 100) {
        throw new Error('Please enter 100 or fewer cards.');
      }

      const prompt = `Generate exactly ${count} practice flashcards for "${topic}". ${description ? `Cover these specific topics: ${description}.` : ''} CRITICAL RULES: 1) Every card must be an actual practice question that could realistically appear on this exam or in this subject. 2) NEVER generate questions about the test itself (like "what does ${topic} stand for" or "how many sections does the test have"). 3) Front of card = a specific practice question, problem, or key term. 4) Back of card = the correct answer, solution, or definition. 5) Make cards progressively harder from beginner to advanced. 6) Use the exact style and difficulty level of the real exam.`;

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
      router.push({ pathname: '/deck/[deckId]' as any, params: { deckId: newDeck.id } });
    },
    onError: (error) => {
      console.error('[CreateScreen] Generation error:', error);
      Alert.alert('Generation Failed', error.message || 'Could not generate flashcards. Please try again.');
    },
  });

  const canGenerate = topic.trim().length > 0 && !generateMutation.isPending && numCards.trim().length > 0;

  // --- Manual Creation ---
  const addManualCard = () => {
    setManualCards((prev) => [
      ...prev,
      { id: Date.now().toString(), front: '', back: '' },
    ]);
  };

  const updateManualCard = (id: string, field: 'front' | 'back', value: string) => {
    setManualCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeManualCard = (id: string) => {
    if (manualCards.length <= 1) {
      Alert.alert('Cannot Remove', 'You need at least one card.');
      return;
    }
    setManualCards((prev) => prev.filter((c) => c.id !== id));
  };

  const saveManualDeck = () => {
    if (!manualTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a deck title.');
      return;
    }

    const validCards = manualCards.filter((c) => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      Alert.alert('No Cards', 'Please fill in at least one card with both front and back.');
      return;
    }

    const newDeck: Deck = {
      id: Date.now().toString(),
      title: manualTitle.trim(),
      description: manualDescription.trim() || `Custom flashcard deck`,
      category: 'custom',
      subcategory: 'custom',
      cards: validCards.map((card, i) => ({
        id: `${Date.now()}-${i}`,
        front: card.front.trim(),
        back: card.back.trim(),
        mastered: false,
      })),
      createdAt: new Date().toISOString(),
      lastStudied: null,
      totalStudySessions: 0,
      color: selectedColor,
    };

    addDeck(newDeck);
    router.push({ pathname: '/deck/[deckId]' as any, params: { deckId: newDeck.id } });
  };

  const filledManualCards = manualCards.filter((c) => c.front.trim() && c.back.trim()).length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <Pressable
            style={[styles.modeToggle, mode === 'ai' && styles.modeToggleActive]}
            onPress={() => setMode('ai')}
          >
            <Sparkles size={16} color={mode === 'ai' ? '#FFFFFF' : Colors.textSecondary} />
            <Text style={[styles.modeToggleText, mode === 'ai' && styles.modeToggleTextActive]}>AI Generate</Text>
          </Pressable>
          <Pressable
            style={[styles.modeToggle, mode === 'manual' && styles.modeToggleActive]}
            onPress={() => setMode('manual')}
          >
            <PenLine size={16} color={mode === 'manual' ? '#FFFFFF' : Colors.textSecondary} />
            <Text style={[styles.modeToggleText, mode === 'manual' && styles.modeToggleTextActive]}>Manual</Text>
          </Pressable>
        </View>

        {mode === 'ai' ? (
          /* ======================== AI MODE ======================== */
          <>
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
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <Hash size={16} color={Colors.textSecondary} />
                  <Text style={styles.labelText}>Number of Cards</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter number of cards (e.g., 10, 25, 50)"
                  placeholderTextColor={Colors.textTertiary}
                  value={numCards}
                  onChangeText={(text) => setNumCards(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.labelText}>Deck Color</Text>
                <View style={styles.colorsContainer}>
                  {cardColors.map((color) => (
                    <Pressable
                      key={color}
                      style={[styles.colorChip, { backgroundColor: color }, selectedColor === color && styles.colorChipActive]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>
              </View>
            </View>

            <Pressable
              style={[styles.generateButton, !canGenerate && styles.buttonDisabled]}
              onPress={() => generateMutation.mutate()}
              disabled={!canGenerate}
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
          </>
        ) : (
          /* ======================== MANUAL MODE ======================== */
          <>
            <View style={styles.headerSection}>
              <View style={[styles.aiIconContainer, { backgroundColor: Colors.accentLight }]}>
                <PenLine size={28} color={Colors.accent} />
              </View>
              <Text style={styles.headerTitle}>Create Your Own</Text>
              <Text style={styles.headerSubtitle}>Build a custom deck with your own questions and answers</Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <BookOpen size={16} color={Colors.textSecondary} />
                  <Text style={styles.labelText}>Deck Title</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Chapter 5 Review, Spanish Verbs..."
                  placeholderTextColor={Colors.textTertiary}
                  value={manualTitle}
                  onChangeText={setManualTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <Layers size={16} color={Colors.textSecondary} />
                  <Text style={styles.labelText}>Description (optional)</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="What is this deck about?"
                  placeholderTextColor={Colors.textTertiary}
                  value={manualDescription}
                  onChangeText={setManualDescription}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.labelText}>Deck Color</Text>
                <View style={styles.colorsContainer}>
                  {cardColors.map((color) => (
                    <Pressable
                      key={color}
                      style={[styles.colorChip, { backgroundColor: color }, selectedColor === color && styles.colorChipActive]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Cards */}
            <View style={styles.cardsHeader}>
              <Text style={styles.cardsHeaderTitle}>Cards ({filledManualCards}/{manualCards.length})</Text>
            </View>

            {manualCards.map((card, index) => (
              <View key={card.id} style={styles.manualCard}>
                <View style={styles.manualCardHeader}>
                  <Text style={styles.manualCardNumber}>Card {index + 1}</Text>
                  {manualCards.length > 1 && (
                    <Pressable onPress={() => removeManualCard(card.id)} hitSlop={8}>
                      <Trash2 size={16} color={Colors.coral} />
                    </Pressable>
                  )}
                </View>
                <TextInput
                  style={styles.manualCardInput}
                  placeholder="Front — question or term"
                  placeholderTextColor={Colors.textTertiary}
                  value={card.front}
                  onChangeText={(v) => updateManualCard(card.id, 'front', v)}
                  multiline
                />
                <View style={styles.manualCardDivider} />
                <TextInput
                  style={styles.manualCardInput}
                  placeholder="Back — answer or definition"
                  placeholderTextColor={Colors.textTertiary}
                  value={card.back}
                  onChangeText={(v) => updateManualCard(card.id, 'back', v)}
                  multiline
                />
              </View>
            ))}

            <Pressable style={styles.addCardButton} onPress={addManualCard}>
              <Plus size={18} color={Colors.accent} />
              <Text style={styles.addCardButtonText}>Add Card</Text>
            </Pressable>

            <Pressable
              style={[styles.generateButton, { backgroundColor: Colors.accent }, (!manualTitle.trim() || filledManualCards === 0) && styles.buttonDisabled]}
              onPress={saveManualDeck}
              disabled={!manualTitle.trim() || filledManualCards === 0}
            >
              <Layers size={20} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>
                Save Deck ({filledManualCards} card{filledManualCards !== 1 ? 's' : ''})
              </Text>
            </Pressable>
          </>
        )}

        <View style={styles.bottomPadding} />
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
  // Mode Toggle
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 11,
    gap: 6,
  },
  modeToggleActive: {
    backgroundColor: Colors.primary,
  },
  modeToggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
  },
  // Header
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
  // Form
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
    minHeight: 70,
    textAlignVertical: 'top',
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
  // Buttons
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  buttonDisabled: {
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
  // Manual Cards
  cardsHeader: {
    marginBottom: 14,
  },
  cardsHeaderTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  manualCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  manualCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  manualCardNumber: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textTertiary,
  },
  manualCardInput: {
    fontSize: 15,
    color: Colors.text,
    minHeight: 40,
    paddingVertical: 6,
  },
  manualCardDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 6,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 20,
  },
  addCardButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  bottomPadding: {
    height: 40,
  },
});
