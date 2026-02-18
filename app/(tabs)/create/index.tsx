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
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Sparkles,
  Layers,
  BookOpen,
  Hash,
  Plus,
  Trash2,
  PenLine,
  ClipboardPaste,
  Camera,
  Upload,
  ImageIcon,
  FileText,
  X,
} from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { generateObject, generateFromImage, generateFromText } from '@/lib/ai';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
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
type Mode = 'ai' | 'paste' | 'upload' | 'manual';

export default function CreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ topic?: string; category?: string; subcategory?: string; description?: string }>();
  const { addDeck } = useFlashcards();

  const [mode, setMode] = useState<Mode>('ai');
  const [selectedColor, setSelectedColor] = useState(cardColors[0]);

  // AI mode state
  const [topic, setTopic] = useState(params.topic ?? '');
  const [description, setDescription] = useState(params.description ?? '');
  const [numCards, setNumCards] = useState('10');

  // Paste mode state
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [pasteNumCards, setPasteNumCards] = useState('10');

  // Upload mode state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadImage, setUploadImage] = useState<{ uri: string; base64: string; mimeType: string } | null>(null);
  const [uploadDocText, setUploadDocText] = useState<string | null>(null);
  const [uploadDocName, setUploadDocName] = useState<string | null>(null);
  const [uploadNumCards, setUploadNumCards] = useState('10');

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

  // ===================== SHARED =====================
  const saveDeck = (title: string, desc: string, cards: { front: string; back: string }[], cat?: string, subcat?: string) => {
    const newDeck: Deck = {
      id: Date.now().toString(),
      title,
      description: desc,
      category: cat ?? 'custom',
      subcategory: subcat ?? 'custom',
      cards: cards.map((card, i) => ({
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
  };

  // ===================== AI GENERATE =====================
  const aiMutation = useMutation({
    mutationFn: async () => {
      const count = parseInt(numCards, 10);
      if (isNaN(count) || count < 1) throw new Error('Please enter a valid number of cards.');
      if (count > 100) throw new Error('Please enter 100 or fewer cards.');

      const prompt = `Generate exactly ${count} practice flashcards for "${topic}". ${description ? `Cover these specific topics: ${description}.` : ''} CRITICAL RULES: 1) Every card must be an actual practice question that could realistically appear on this exam or in this subject. 2) NEVER generate questions about the test itself (like "what does ${topic} stand for" or "how many sections does the test have"). 3) Front of card = a specific practice question, problem, or key term. 4) Back of card = the correct answer, solution, or definition. 5) Make cards progressively harder from beginner to advanced. 6) Use the exact style and difficulty level of the real exam.`;

      return generateObject({ messages: [{ role: 'user', content: prompt }], schema: flashcardSchema });
    },
    onSuccess: (data) => {
      saveDeck(topic, description || `AI-generated flashcards for ${topic}`, data.cards, params.category, params.subcategory);
    },
    onError: (error) => {
      Alert.alert('Generation Failed', error.message || 'Could not generate flashcards.');
    },
  });

  // ===================== PASTE NOTES =====================
  const pasteMutation = useMutation({
    mutationFn: async () => {
      if (!pasteText.trim()) throw new Error('Please paste some text first.');
      const count = parseInt(pasteNumCards, 10);
      if (isNaN(count) || count < 1) throw new Error('Please enter a valid number of cards.');
      if (count > 100) throw new Error('Please enter 100 or fewer cards.');

      const prompt = `Read the following notes/text carefully and generate exactly ${count} flashcards from the content. Extract the most important concepts, terms, facts, and relationships. Front of card = a specific question or key term from the notes. Back of card = the correct answer or definition. Make sure all cards are directly based on the provided content.`;

      return generateFromText({ text: pasteText, prompt, schema: flashcardSchema });
    },
    onSuccess: (data) => {
      saveDeck(pasteTitle || 'Notes Flashcards', 'Generated from pasted notes', data.cards);
    },
    onError: (error) => {
      Alert.alert('Generation Failed', error.message || 'Could not generate flashcards.');
    },
  });

  // ===================== UPLOAD =====================
  const pickImage = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', `Please allow access to your ${useCamera ? 'camera' : 'photo library'}.`);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8, mediaTypes: ['images'] });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setUploadImage({
          uri: asset.uri,
          base64: asset.base64 || '',
          mimeType: asset.mimeType || 'image/jpeg',
        });
        setUploadDocText(null);
        setUploadDocName(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const content = await FileSystem.readAsStringAsync(file.uri);
        setUploadDocText(content);
        setUploadDocName(file.name);
        setUploadImage(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read document. Make sure it is a text file.');
    }
  };

  const clearUpload = () => {
    setUploadImage(null);
    setUploadDocText(null);
    setUploadDocName(null);
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const count = parseInt(uploadNumCards, 10);
      if (isNaN(count) || count < 1) throw new Error('Please enter a valid number of cards.');
      if (count > 100) throw new Error('Please enter 100 or fewer cards.');

      if (uploadImage) {
        const prompt = `Look at this image of notes/study material and generate exactly ${count} flashcards from the visible content. Extract the most important concepts, terms, facts, and relationships you can see. Front of card = a specific question or key term. Back of card = the correct answer or definition. Make sure all cards are based on what is actually shown in the image.`;

        return generateFromImage({
          imageBase64: uploadImage.base64,
          mimeType: uploadImage.mimeType,
          prompt,
          schema: flashcardSchema,
        });
      } else if (uploadDocText) {
        const prompt = `Read the following document carefully and generate exactly ${count} flashcards from the content. Extract the most important concepts, terms, facts, and relationships. Front of card = a specific question or key term. Back of card = the correct answer or definition.`;

        return generateFromText({ text: uploadDocText, prompt, schema: flashcardSchema });
      } else {
        throw new Error('Please upload an image or document first.');
      }
    },
    onSuccess: (data) => {
      saveDeck(uploadTitle || 'Uploaded Notes', 'Generated from uploaded content', data.cards);
    },
    onError: (error) => {
      Alert.alert('Generation Failed', error.message || 'Could not generate flashcards.');
    },
  });

  // ===================== MANUAL =====================
  const addManualCard = () => {
    setManualCards((prev) => [...prev, { id: Date.now().toString(), front: '', back: '' }]);
  };

  const updateManualCard = (id: string, field: 'front' | 'back', value: string) => {
    setManualCards((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
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
    saveDeck(manualTitle.trim(), manualDescription.trim() || 'Custom flashcard deck', validCards);
  };

  const filledManualCards = manualCards.filter((c) => c.front.trim() && c.back.trim()).length;
  const isGenerating = aiMutation.isPending || pasteMutation.isPending || uploadMutation.isPending;

  const modes: { key: Mode; label: string; icon: any }[] = [
    { key: 'ai', label: 'AI Generate', icon: Sparkles },
    { key: 'paste', label: 'Paste Notes', icon: ClipboardPaste },
    { key: 'upload', label: 'Upload', icon: Upload },
    { key: 'manual', label: 'Manual', icon: PenLine },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Mode Toggle */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeToggleScroll}>
          {modes.map((m) => {
            const Icon = m.icon;
            const active = mode === m.key;
            return (
              <Pressable
                key={m.key}
                style={[styles.modeToggle, active && styles.modeToggleActive]}
                onPress={() => setMode(m.key)}
              >
                <Icon size={15} color={active ? '#FFFFFF' : Colors.textSecondary} />
                <Text style={[styles.modeToggleText, active && styles.modeToggleTextActive]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ======================== AI MODE ======================== */}
        {mode === 'ai' && (
          <>
            <View style={styles.headerSection}>
              <View style={styles.iconContainer}>
                <Sparkles size={28} color={Colors.amber} />
              </View>
              <Text style={styles.headerTitle}>AI Flashcard Generator</Text>
              <Text style={styles.headerSubtitle}>Enter a topic and let AI create study-ready flashcards</Text>
            </View>

            <View style={styles.formSection}>
              <InputGroup icon={BookOpen} label="Topic">
                <TextInput
                  style={styles.input}
                  placeholder="e.g., SAT Vocabulary, Cell Biology..."
                  placeholderTextColor={Colors.textTertiary}
                  value={topic}
                  onChangeText={setTopic}
                />
              </InputGroup>

              <InputGroup icon={Layers} label="Description (optional)">
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Add specific details or focus areas..."
                  placeholderTextColor={Colors.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </InputGroup>

              <InputGroup icon={Hash} label="Number of Cards">
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 10, 25, 50"
                  placeholderTextColor={Colors.textTertiary}
                  value={numCards}
                  onChangeText={(t) => setNumCards(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </InputGroup>

              <ColorPicker selected={selectedColor} onSelect={setSelectedColor} />
            </View>

            <GenerateButton
              label="Generate Flashcards"
              loading={aiMutation.isPending}
              disabled={!topic.trim() || isGenerating}
              onPress={() => aiMutation.mutate()}
              color={Colors.primary}
              icon={<Sparkles size={20} color="#FFFFFF" />}
            />
          </>
        )}

        {/* ======================== PASTE MODE ======================== */}
        {mode === 'paste' && (
          <>
            <View style={styles.headerSection}>
              <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                <ClipboardPaste size={28} color="#3B82F6" />
              </View>
              <Text style={styles.headerTitle}>Paste Your Notes</Text>
              <Text style={styles.headerSubtitle}>Paste text from your notes, textbook, or study guide and AI will create flashcards</Text>
            </View>

            <View style={styles.formSection}>
              <InputGroup icon={BookOpen} label="Deck Title (optional)">
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Chapter 5 Notes, Bio Lecture..."
                  placeholderTextColor={Colors.textTertiary}
                  value={pasteTitle}
                  onChangeText={setPasteTitle}
                />
              </InputGroup>

              <InputGroup icon={ClipboardPaste} label="Your Notes">
                <TextInput
                  style={[styles.input, styles.largeInput]}
                  placeholder="Paste your notes, study material, or textbook text here..."
                  placeholderTextColor={Colors.textTertiary}
                  value={pasteText}
                  onChangeText={setPasteText}
                  multiline
                  textAlignVertical="top"
                />
              </InputGroup>

              {pasteText.trim().length > 0 && (
                <Text style={styles.charCount}>{pasteText.length.toLocaleString()} characters</Text>
              )}

              <InputGroup icon={Hash} label="Number of Cards">
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 10, 25, 50"
                  placeholderTextColor={Colors.textTertiary}
                  value={pasteNumCards}
                  onChangeText={(t) => setPasteNumCards(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </InputGroup>

              <ColorPicker selected={selectedColor} onSelect={setSelectedColor} />
            </View>

            <GenerateButton
              label="Generate from Notes"
              loading={pasteMutation.isPending}
              disabled={!pasteText.trim() || isGenerating}
              onPress={() => pasteMutation.mutate()}
              color="#3B82F6"
              icon={<Sparkles size={20} color="#FFFFFF" />}
            />
          </>
        )}

        {/* ======================== UPLOAD MODE ======================== */}
        {mode === 'upload' && (
          <>
            <View style={styles.headerSection}>
              <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
                <Upload size={28} color="#8B5CF6" />
              </View>
              <Text style={styles.headerTitle}>Upload & Generate</Text>
              <Text style={styles.headerSubtitle}>Take a photo of your notes or upload a text file</Text>
            </View>

            <View style={styles.formSection}>
              <InputGroup icon={BookOpen} label="Deck Title (optional)">
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Lecture Notes, Textbook Ch. 3..."
                  placeholderTextColor={Colors.textTertiary}
                  value={uploadTitle}
                  onChangeText={setUploadTitle}
                />
              </InputGroup>

              {!uploadImage && !uploadDocText && (
                <View style={styles.uploadOptions}>
                  <Pressable style={styles.uploadOptionButton} onPress={() => pickImage(true)}>
                    <Camera size={24} color={Colors.accent} />
                    <Text style={styles.uploadOptionLabel}>Take Photo</Text>
                    <Text style={styles.uploadOptionHint}>Photo your notes</Text>
                  </Pressable>

                  <Pressable style={styles.uploadOptionButton} onPress={() => pickImage(false)}>
                    <ImageIcon size={24} color="#3B82F6" />
                    <Text style={styles.uploadOptionLabel}>Gallery</Text>
                    <Text style={styles.uploadOptionHint}>Pick an image</Text>
                  </Pressable>

                  <Pressable style={styles.uploadOptionButton} onPress={pickDocument}>
                    <FileText size={24} color="#8B5CF6" />
                    <Text style={styles.uploadOptionLabel}>Document</Text>
                    <Text style={styles.uploadOptionHint}>.txt files</Text>
                  </Pressable>
                </View>
              )}

              {uploadImage && (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: uploadImage.uri }} style={styles.imagePreview} resizeMode="cover" />
                  <Pressable style={styles.removePreview} onPress={clearUpload}>
                    <X size={16} color="#FFFFFF" />
                  </Pressable>
                  <Text style={styles.previewLabel}>Image ready for scanning</Text>
                </View>
              )}

              {uploadDocText && (
                <View style={styles.docPreviewContainer}>
                  <View style={styles.docPreviewHeader}>
                    <FileText size={20} color="#8B5CF6" />
                    <Text style={styles.docPreviewName} numberOfLines={1}>{uploadDocName}</Text>
                    <Pressable onPress={clearUpload} hitSlop={8}>
                      <X size={18} color={Colors.textTertiary} />
                    </Pressable>
                  </View>
                  <Text style={styles.docPreviewText} numberOfLines={4}>{uploadDocText}</Text>
                  <Text style={styles.charCount}>{uploadDocText.length.toLocaleString()} characters</Text>
                </View>
              )}

              {(uploadImage || uploadDocText) && (
                <>
                  <InputGroup icon={Hash} label="Number of Cards">
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 10, 25, 50"
                      placeholderTextColor={Colors.textTertiary}
                      value={uploadNumCards}
                      onChangeText={(t) => setUploadNumCards(t.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  </InputGroup>

                  <ColorPicker selected={selectedColor} onSelect={setSelectedColor} />
                </>
              )}
            </View>

            {(uploadImage || uploadDocText) && (
              <GenerateButton
                label="Generate from Upload"
                loading={uploadMutation.isPending}
                disabled={isGenerating}
                onPress={() => uploadMutation.mutate()}
                color="#8B5CF6"
                icon={<Sparkles size={20} color="#FFFFFF" />}
              />
            )}
          </>
        )}

        {/* ======================== MANUAL MODE ======================== */}
        {mode === 'manual' && (
          <>
            <View style={styles.headerSection}>
              <View style={[styles.iconContainer, { backgroundColor: Colors.accentLight }]}>
                <PenLine size={28} color={Colors.accent} />
              </View>
              <Text style={styles.headerTitle}>Create Your Own</Text>
              <Text style={styles.headerSubtitle}>Build a custom deck with your own questions and answers</Text>
            </View>

            <View style={styles.formSection}>
              <InputGroup icon={BookOpen} label="Deck Title">
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Chapter 5 Review, Spanish Verbs..."
                  placeholderTextColor={Colors.textTertiary}
                  value={manualTitle}
                  onChangeText={setManualTitle}
                />
              </InputGroup>

              <InputGroup icon={Layers} label="Description (optional)">
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="What is this deck about?"
                  placeholderTextColor={Colors.textTertiary}
                  value={manualDescription}
                  onChangeText={setManualDescription}
                  multiline
                  numberOfLines={2}
                />
              </InputGroup>

              <ColorPicker selected={selectedColor} onSelect={setSelectedColor} />
            </View>

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

            <GenerateButton
              label={`Save Deck (${filledManualCards} card${filledManualCards !== 1 ? 's' : ''})`}
              loading={false}
              disabled={!manualTitle.trim() || filledManualCards === 0}
              onPress={saveManualDeck}
              color={Colors.accent}
              icon={<Layers size={20} color="#FFFFFF" />}
            />
          </>
        )}

        {isGenerating && (
          <View style={styles.loadingHint}>
            <Text style={styles.loadingHintText}>
              {mode === 'upload' && uploadImage
                ? 'AI is reading your image and creating flashcards...'
                : 'AI is creating your flashcards. This may take a moment...'}
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ===================== REUSABLE COMPONENTS =====================

function InputGroup({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <View style={styles.inputGroup}>
      <View style={styles.inputLabel}>
        <Icon size={16} color={Colors.textSecondary} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

function ColorPicker({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.labelText}>Deck Color</Text>
      <View style={styles.colorsContainer}>
        {cardColors.map((color) => (
          <Pressable
            key={color}
            style={[styles.colorChip, { backgroundColor: color }, selected === color && styles.colorChipActive]}
            onPress={() => onSelect(color)}
          />
        ))}
      </View>
    </View>
  );
}

function GenerateButton({
  label, loading, disabled, onPress, color, icon,
}: {
  label: string; loading: boolean; disabled: boolean; onPress: () => void; color: string; icon: React.ReactNode;
}) {
  return (
    <Pressable
      style={[styles.generateButton, { backgroundColor: color }, (disabled || loading) && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : icon}
      <Text style={styles.generateButtonText}>{loading ? 'Generating...' : label}</Text>
    </Pressable>
  );
}

// ===================== STYLES =====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  modeToggleScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    paddingRight: 4,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  modeToggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
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
    minHeight: 70,
    textAlignVertical: 'top',
  },
  largeInput: {
    minHeight: 160,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: -12,
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
  uploadOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadOptionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  uploadOptionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  uploadOptionHint: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  previewContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  removePreview: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 10,
  },
  docPreviewContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  docPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docPreviewName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  docPreviewText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
