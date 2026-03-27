export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  cards: Flashcard[];
  createdAt: string;
  lastStudied: string | null;
  totalStudySessions: number;
  color: string;
}

export interface Category {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  title: string;
  description: string;
}

export type StudyResult = {
  deckId: string;
  totalCards: number;
  masteredCards: number;
  date: string;
};
