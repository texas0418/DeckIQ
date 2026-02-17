import { Category } from '@/types/flashcard';

export const categories: Category[] = [
  {
    id: 'elementary',
    title: 'Elementary School',
    subtitle: 'Grades K-5',
    icon: 'Blocks',
    color: '#10B981',
    subcategories: [
      { id: 'elem-math', title: 'Math Basics', description: 'Addition, subtraction, multiplication, division, fractions, and word problems' },
      { id: 'elem-reading', title: 'Reading & Vocabulary', description: 'Sight words, reading comprehension passages, phonics rules, and vocabulary definitions' },
      { id: 'elem-science', title: 'Science', description: 'Parts of a plant, the water cycle, states of matter, the solar system, and animal habitats' },
      { id: 'elem-social', title: 'Social Studies', description: 'US states and capitals, map skills, community helpers, national holidays, and basic government' },
    ],
  },
  {
    id: 'middle',
    title: 'Middle School',
    subtitle: 'Grades 6-8',
    icon: 'BookOpen',
    color: '#3B82F6',
    subcategories: [
      { id: 'mid-math', title: 'Pre-Algebra & Algebra', description: 'Solving equations, inequalities, graphing linear functions, ratios, proportions, and exponents' },
      { id: 'mid-science', title: 'Life & Physical Science', description: 'Cell structure and function, the periodic table, chemical reactions, forces, motion, and energy' },
      { id: 'mid-english', title: 'English Language Arts', description: 'Parts of speech, sentence structure, literary devices, essay writing, and reading analysis' },
      { id: 'mid-history', title: 'World History', description: 'Ancient Egypt, Greece, Rome, the Middle Ages, the Renaissance, and early exploration' },
    ],
  },
  {
    id: 'highschool',
    title: 'High School',
    subtitle: 'Grades 9-12',
    icon: 'GraduationCap',
    color: '#8B5CF6',
    subcategories: [
      { id: 'hs-algebra', title: 'Algebra & Calculus', description: 'Quadratic equations, polynomials, limits, derivatives, integrals, and trigonometric functions' },
      { id: 'hs-biology', title: 'Biology', description: 'DNA replication, mitosis and meiosis, natural selection, ecology, human body systems, and genetics problems' },
      { id: 'hs-chemistry', title: 'Chemistry', description: 'Balancing chemical equations, molar mass calculations, electron configurations, acid-base reactions, and stoichiometry' },
      { id: 'hs-physics', title: 'Physics', description: 'Newton\'s laws of motion, projectile motion, energy conservation, electric circuits, and wave properties' },
      { id: 'hs-english', title: 'English Literature', description: 'Shakespeare analysis, rhetorical strategies, AP essay prompts, literary movements, and poetry analysis' },
      { id: 'hs-history', title: 'US & World History', description: 'The American Revolution, Civil War, World War I and II, the Cold War, civil rights movement, and Constitutional amendments' },
    ],
  },
  {
    id: 'standardized',
    title: 'Standardized Tests',
    subtitle: 'SAT, ACT, GED & more',
    icon: 'FileCheck',
    color: '#F59E0B',
    subcategories: [
      { id: 'sat', title: 'SAT', description: 'SAT-style reading comprehension, grammar and punctuation rules, algebra and data analysis problems, and advanced math' },
      { id: 'act', title: 'ACT', description: 'ACT English grammar rules, math problems covering algebra through trigonometry, science data interpretation, and reading passage analysis' },
      { id: 'ged', title: 'GED', description: 'GED-level math word problems, science reasoning questions, social studies document analysis, and language arts grammar and reading' },
      { id: 'clt', title: 'CLT', description: 'Verbal reasoning with classic literature passages, grammar and writing mechanics, and quantitative reasoning math problems' },
      { id: 'ap-exams', title: 'AP Exams', description: 'AP-style multiple choice and free response questions covering history, science, English, and math subjects' },
      { id: 'psat', title: 'PSAT/NMSQT', description: 'PSAT reading and writing practice questions, math problem solving, and vocabulary in context' },
    ],
  },
  {
    id: 'graduate',
    title: 'Graduate & Professional',
    subtitle: 'MCAT, LSAT, GRE & more',
    icon: 'Award',
    color: '#EF6461',
    subcategories: [
      { id: 'mcat', title: 'MCAT', description: 'Organic chemistry reactions, amino acid structures, biology of organ systems, physics equations, psychology concepts, and biochemistry pathways as tested on the MCAT' },
      { id: 'lsat', title: 'LSAT', description: 'Logical reasoning arguments and flaws, analytical reasoning logic games, reading comprehension of dense legal and academic passages as tested on the LSAT' },
      { id: 'gre', title: 'GRE', description: 'GRE-level vocabulary words and definitions, reading comprehension of academic passages, quantitative comparison problems, and algebra and geometry' },
      { id: 'gmat', title: 'GMAT', description: 'GMAT data sufficiency problems, critical reasoning arguments, sentence correction grammar rules, and quantitative problem solving' },
      { id: 'dat', title: 'DAT', description: 'General chemistry and organic chemistry reactions, biology of human systems, perceptual ability spatial reasoning, and quantitative reasoning as tested on the DAT' },
      { id: 'nclex', title: 'NCLEX', description: 'Nursing pharmacology drug classes and side effects, patient prioritization and triage, infection control protocols, and clinical nursing procedures as tested on the NCLEX' },
      { id: 'bar', title: 'Bar Exam', description: 'Constitutional law principles, criminal law elements, contract formation and defenses, torts and negligence, civil procedure rules, and evidence rules as tested on the Bar Exam' },
      { id: 'cpa', title: 'CPA Exam', description: 'Financial accounting standards (GAAP), audit procedures and opinions, tax law for individuals and businesses, and business environment and regulation concepts as tested on the CPA Exam' },
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
