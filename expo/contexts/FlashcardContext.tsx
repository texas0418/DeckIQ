import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Deck, Flashcard, StudyResult } from '@/types/flashcard';

const DECKS_KEY = 'deckiq_decks';
const RESULTS_KEY = 'deckiq_results';

export const [FlashcardProvider, useFlashcards] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [studyResults, setStudyResults] = useState<StudyResult[]>([]);

  const decksQuery = useQuery({
    queryKey: ['decks'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(DECKS_KEY);
      return stored ? (JSON.parse(stored) as Deck[]) : [];
    },
  });

  const resultsQuery = useQuery({
    queryKey: ['studyResults'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(RESULTS_KEY);
      return stored ? (JSON.parse(stored) as StudyResult[]) : [];
    },
  });

  useEffect(() => {
    if (decksQuery.data) {
      setDecks(decksQuery.data);
    }
  }, [decksQuery.data]);

  useEffect(() => {
    if (resultsQuery.data) {
      setStudyResults(resultsQuery.data);
    }
  }, [resultsQuery.data]);

  const saveDecksMutation = useMutation({
    mutationFn: async (updated: Deck[]) => {
      await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
    },
  });

  const saveResultsMutation = useMutation({
    mutationFn: async (updated: StudyResult[]) => {
      await AsyncStorage.setItem(RESULTS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyResults'] });
    },
  });

  const addDeck = useCallback((deck: Deck) => {
    setDecks((prev) => {
      const updated = [deck, ...prev];
      saveDecksMutation.mutate(updated);
      return updated;
    });
  }, []);

  const updateDeck = useCallback((deckId: string, updates: Partial<Deck>) => {
    setDecks((prev) => {
      const updated = prev.map((d) => (d.id === deckId ? { ...d, ...updates } : d));
      saveDecksMutation.mutate(updated);
      return updated;
    });
  }, []);

  const deleteDeck = useCallback((deckId: string) => {
    setDecks((prev) => {
      const updated = prev.filter((d) => d.id !== deckId);
      saveDecksMutation.mutate(updated);
      return updated;
    });
  }, []);

  const updateCard = useCallback((deckId: string, cardId: string, updates: Partial<Flashcard>) => {
    setDecks((prev) => {
      const updated = prev.map((d) => {
        if (d.id !== deckId) return d;
        return {
          ...d,
          cards: d.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
        };
      });
      saveDecksMutation.mutate(updated);
      return updated;
    });
  }, []);

  const addStudyResult = useCallback((result: StudyResult) => {
    setStudyResults((prev) => {
      const updated = [result, ...prev];
      saveResultsMutation.mutate(updated);
      return updated;
    });
  }, []);

  const getDeck = useCallback((deckId: string) => {
    return decks.find((d) => d.id === deckId) ?? null;
  }, [decks]);

  const totalCardsStudied = studyResults.reduce((sum, r) => sum + r.totalCards, 0);
  const totalMastered = studyResults.reduce((sum, r) => sum + r.masteredCards, 0);

  return {
    decks,
    studyResults,
    addDeck,
    updateDeck,
    deleteDeck,
    updateCard,
    addStudyResult,
    getDeck,
    isLoading: decksQuery.isLoading,
    totalCardsStudied,
    totalMastered,
    totalDecks: decks.length,
    totalSessions: studyResults.length,
  };
});
