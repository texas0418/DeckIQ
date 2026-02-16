import { Category } from '@/types/flashcard';

export const categories: Category[] = [
  {
    id: 'elementary',
    title: 'Elementary School',
    subtitle: 'Grades K-5',
    icon: 'Blocks',
    color: '#10B981',
    subcategories: [
      { id: 'elem-math', title: 'Math Basics', description: 'Addition, subtraction, multiplication, division' },
      { id: 'elem-reading', title: 'Reading & Vocabulary', description: 'Sight words, comprehension, phonics' },
      { id: 'elem-science', title: 'Science', description: 'Earth science, biology basics, weather' },
      { id: 'elem-social', title: 'Social Studies', description: 'Geography, history, communities' },
    ],
  },
  {
    id: 'middle',
    title: 'Middle School',
    subtitle: 'Grades 6-8',
    icon: 'BookOpen',
    color: '#3B82F6',
    subcategories: [
      { id: 'mid-math', title: 'Pre-Algebra & Algebra', description: 'Equations, inequalities, functions' },
      { id: 'mid-science', title: 'Life & Physical Science', description: 'Cells, chemistry, physics basics' },
      { id: 'mid-english', title: 'English Language Arts', description: 'Grammar, literature, writing' },
      { id: 'mid-history', title: 'World History', description: 'Ancient civilizations to modern era' },
    ],
  },
  {
    id: 'highschool',
    title: 'High School',
    subtitle: 'Grades 9-12',
    icon: 'GraduationCap',
    color: '#8B5CF6',
    subcategories: [
      { id: 'hs-algebra', title: 'Algebra & Calculus', description: 'Advanced math concepts' },
      { id: 'hs-biology', title: 'Biology', description: 'AP Biology, anatomy, genetics' },
      { id: 'hs-chemistry', title: 'Chemistry', description: 'Elements, reactions, organic chemistry' },
      { id: 'hs-physics', title: 'Physics', description: 'Mechanics, thermodynamics, waves' },
      { id: 'hs-english', title: 'English Literature', description: 'Classic literature, essays, rhetoric' },
      { id: 'hs-history', title: 'US & World History', description: 'AP History preparation' },
    ],
  },
  {
    id: 'standardized',
    title: 'Standardized Tests',
    subtitle: 'SAT, ACT, GED & more',
    icon: 'FileCheck',
    color: '#F59E0B',
    subcategories: [
      { id: 'sat', title: 'SAT', description: 'Reading, writing, and math sections' },
      { id: 'act', title: 'ACT', description: 'English, math, reading, science' },
      { id: 'ged', title: 'GED', description: 'All four subject areas' },
      { id: 'clt', title: 'CLT', description: 'Verbal reasoning, grammar, quantitative' },
      { id: 'ap-exams', title: 'AP Exams', description: 'Advanced Placement test prep' },
      { id: 'psat', title: 'PSAT/NMSQT', description: 'National Merit Scholarship prep' },
    ],
  },
  {
    id: 'graduate',
    title: 'Graduate & Professional',
    subtitle: 'MCAT, LSAT, GRE & more',
    icon: 'Award',
    color: '#EF6461',
    subcategories: [
      { id: 'mcat', title: 'MCAT', description: 'Medical college admission test' },
      { id: 'lsat', title: 'LSAT', description: 'Law school admission test' },
      { id: 'gre', title: 'GRE', description: 'Graduate record examination' },
      { id: 'gmat', title: 'GMAT', description: 'Graduate management admission test' },
      { id: 'dat', title: 'DAT', description: 'Dental admission test' },
      { id: 'nclex', title: 'NCLEX', description: 'Nursing licensure examination' },
      { id: 'bar', title: 'Bar Exam', description: 'Attorney licensure examination' },
      { id: 'cpa', title: 'CPA Exam', description: 'Certified public accountant exam' },
    ],
  },
];

export const quickStudyTopics = [
  { id: 'vocab-sat', label: 'SAT Vocabulary', category: 'standardized', subcategory: 'sat' },
  { id: 'bio-cells', label: 'Cell Biology', category: 'highschool', subcategory: 'hs-biology' },
  { id: 'us-history', label: 'US History', category: 'highschool', subcategory: 'hs-history' },
  { id: 'algebra', label: 'Algebra Basics', category: 'middle', subcategory: 'mid-math' },
  { id: 'mcat-bio', label: 'MCAT Biology', category: 'graduate', subcategory: 'mcat' },
  { id: 'lsat-logic', label: 'LSAT Logic', category: 'graduate', subcategory: 'lsat' },
];
