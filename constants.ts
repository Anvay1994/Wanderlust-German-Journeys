import { CurriculumModule, GermanLevel } from './types';

// THE BACKBONE: 6 Levels x 12 Modules = 72 Journeys (Comprehensive CEFR)
export const CURRICULUM: CurriculumModule[] = [
  // --- A1: THE TOURIST (Survival German) ---
  {
    id: 'A1.1',
    level: GermanLevel.A1,
    title: 'The Arrival',
    description: 'Land in Frankfurt. Handle passport control and introduce yourself.',
    grammarFocus: ['Sein/Haben', 'Regular Verbs', 'Personal Pronouns'],
    vocabularyTheme: 'Greetings, Countries, Occupations',
    missionType: 'Roleplay'
  },
  {
    id: 'A1.2',
    level: GermanLevel.A1,
    title: 'Hotel Check-in',
    description: 'Check into your hotel. Spell your name and fill out forms.',
    grammarFocus: ['The Alphabet', 'Spelling', 'Numbers 0-100'],
    vocabularyTheme: 'Personal Data, Forms, Hotel',
    missionType: 'Roleplay'
  },
  {
    id: 'A1.3',
    level: GermanLevel.A1,
    title: 'Hunger & Thirst',
    description: 'Order food at a Café. Learn to say what you would like.',
    grammarFocus: ['Accusative Case (Basic)', 'Möchten (Would like)', 'Plurals'],
    vocabularyTheme: 'Food, Drinks, Prices',
    missionType: 'Roleplay'
  },
  {
    id: 'A1.4',
    level: GermanLevel.A1,
    title: 'The Supermarket',
    description: 'Buy groceries for a picnic. Ask for items.',
    grammarFocus: ['Definite vs Indefinite Articles', 'Negation (kein)'],
    vocabularyTheme: 'Groceries, Fruits, Vegetables',
    missionType: 'Investigation'
  },
  {
    id: 'A1.5',
    level: GermanLevel.A1,
    title: 'City Explorer',
    description: 'Ask for directions in Munich. Navigate the streets.',
    grammarFocus: ['Imperative (Simple)', 'W-Questions', 'Prepositions (in, nach)'],
    vocabularyTheme: 'Directions, Places, City',
    missionType: 'Investigation'
  },
  {
    id: 'A1.6',
    level: GermanLevel.A1,
    title: 'Public Transport',
    description: 'Buy a U-Bahn ticket and understand the schedule.',
    grammarFocus: ['Time Expressions', 'Modal Verbs (können/müssen)'],
    vocabularyTheme: 'Transport, Time, Tickets',
    missionType: 'Puzzle'
  },
  {
    id: 'A1.7',
    level: GermanLevel.A1,
    title: 'My Family',
    description: 'Show a photo of your family and describe them.',
    grammarFocus: ['Possessive Articles (mein, dein)', 'Ja/Nein Questions'],
    vocabularyTheme: 'Family, Relationships, Ages',
    missionType: 'Roleplay'
  },
  {
    id: 'A1.8',
    level: GermanLevel.A1,
    title: 'Daily Routine',
    description: 'Describe your day to a new friend.',
    grammarFocus: ['Separable Verbs', 'Word Order (Time before Place)'],
    vocabularyTheme: 'Routine, Verbs, Times of Day',
    missionType: 'Roleplay'
  },
  {
    id: 'A1.9',
    level: GermanLevel.A1,
    title: 'Shopping Spree',
    description: 'Buy a souvenir in Cologne. Discuss colors and sizes.',
    grammarFocus: ['Adjectives (Predicative)', 'Demonstratives (dieser)'],
    vocabularyTheme: 'Clothing, Colors, Souvenirs',
    missionType: 'Negotiation'
  },
  {
    id: 'A1.10',
    level: GermanLevel.A1,
    title: 'The Weather',
    description: 'Plan a trip based on the forecast.',
    grammarFocus: ['Es gibt', 'Impersonal Verbs'],
    vocabularyTheme: 'Weather, Seasons, Months',
    missionType: 'Puzzle'
  },
  {
    id: 'A1.11',
    level: GermanLevel.A1,
    title: 'Free Time',
    description: 'Discuss hobbies and arrange a meeting.',
    grammarFocus: ['Verbs with Accusative', 'Word Order Inversion'],
    vocabularyTheme: 'Hobbies, Sports, Leisure',
    missionType: 'Roleplay'
  },
  {
    id: 'A1.12',
    level: GermanLevel.A1,
    title: 'Postcard Home',
    description: 'Write about what you have done so far.',
    grammarFocus: ['Perfect Tense (Introduction)', 'Participle II'],
    vocabularyTheme: 'Travel Activities, Adjectives',
    missionType: 'Investigation'
  },

  // --- A2: THE RESIDENT (Daily Life) ---
  {
    id: 'A2.1',
    level: GermanLevel.A2,
    title: 'Apartment Hunting',
    description: 'View an apartment in Berlin. Discuss rooms.',
    grammarFocus: ['Prepositions with Dative', 'There is/are'],
    vocabularyTheme: 'Housing, Furniture, Rooms',
    missionType: 'Investigation'
  },
  {
    id: 'A2.2',
    level: GermanLevel.A2,
    title: 'Furniture Shopping',
    description: 'Furnish your new room. Compare items.',
    grammarFocus: ['Adjective Endings (Definite)', 'Comparative'],
    vocabularyTheme: 'Furniture, Materials, Describing',
    missionType: 'Negotiation'
  },
  {
    id: 'A2.3',
    level: GermanLevel.A2,
    title: 'Restaurant Booking',
    description: 'Make a reservation by phone for a group.',
    grammarFocus: ['Modal Verbs (Past/Präteritum)', 'Polite Requests'],
    vocabularyTheme: 'Restaurant, Telephoning, Dining',
    missionType: 'Roleplay'
  },
  {
    id: 'A2.4',
    level: GermanLevel.A2,
    title: 'At the Doctor',
    description: 'Visit a doctor. Describe your symptoms.',
    grammarFocus: ['Imperative (Formal)', 'Reflexive Verbs (Body)'],
    vocabularyTheme: 'Body, Health, Illness',
    missionType: 'Roleplay'
  },
  {
    id: 'A2.5',
    level: GermanLevel.A2,
    title: 'Train Travel',
    description: 'Navigate a delay and change trains.',
    grammarFocus: ['Connectors (und, oder, aber)', 'Future (werden)'],
    vocabularyTheme: 'Travel, Delays, Stations',
    missionType: 'Puzzle'
  },
  {
    id: 'A2.6',
    level: GermanLevel.A2,
    title: 'Post Office & Bank',
    description: 'Open a bank account and mail a package.',
    grammarFocus: ['Dative Verbs', 'Ordinal Numbers'],
    vocabularyTheme: 'Service, Banking, Mail',
    missionType: 'Investigation'
  },
  {
    id: 'A2.7',
    level: GermanLevel.A2,
    title: 'Weekend Trip',
    description: 'Tell a story about your hiking trip.',
    grammarFocus: ['Perfect Tense (Motion vs State)', 'Time Adverbs'],
    vocabularyTheme: 'Nature, Hiking, Activities',
    missionType: 'Roleplay'
  },
  {
    id: 'A2.8',
    level: GermanLevel.A2,
    title: 'Birthday Party',
    description: 'Buy a gift and accept an invitation.',
    grammarFocus: ['Personal Pronouns (Dative)', 'Prepositions (für, ohne)'],
    vocabularyTheme: 'Celebrations, Gifts, Dates',
    missionType: 'Negotiation'
  },
  {
    id: 'A2.9',
    level: GermanLevel.A2,
    title: 'Fashion & Style',
    description: 'Give advice on what to wear.',
    grammarFocus: ['Superlative', 'Adjective Endings (Indefinite)'],
    vocabularyTheme: 'Fashion, Looks, Opinions',
    missionType: 'Roleplay'
  },
  {
    id: 'A2.10',
    level: GermanLevel.A2,
    title: 'Job Hunt',
    description: 'Read job ads and understand requirements.',
    grammarFocus: ['Modal Verbs (Meaning nuances)', 'Compound Nouns'],
    vocabularyTheme: 'Work, Tasks, Professions',
    missionType: 'Investigation'
  },
  {
    id: 'A2.11',
    level: GermanLevel.A2,
    title: 'School Memories',
    description: 'Talk about your childhood.',
    grammarFocus: ['Simple Past (Präteritum - war/hatte)', 'Subordinate (als, wenn)'],
    vocabularyTheme: 'School, Childhood, Past',
    missionType: 'Roleplay'
  },
  {
    id: 'A2.12',
    level: GermanLevel.A2,
    title: 'Neighborhood Gossip',
    description: 'Chat with a neighbor about the community.',
    grammarFocus: ['Reflexive Verbs (Acc/Dat)', 'Question Words (Worauf, Womit)'],
    vocabularyTheme: 'Community, Gossip, Daily Life',
    missionType: 'Roleplay'
  },

  // --- B1: THE LOCAL (Independent) ---
  {
    id: 'B1.1',
    level: GermanLevel.B1,
    title: 'Job Interview',
    description: 'Apply for a job. Discuss strengths and weaknesses.',
    grammarFocus: ['Subordinate Clauses (weil, dass)', 'Infinitives with zu'],
    vocabularyTheme: 'CV, Interview, Skills',
    missionType: 'Roleplay'
  },
  {
    id: 'B1.2',
    level: GermanLevel.B1,
    title: 'Customer Service',
    description: 'Complain about a broken laptop.',
    grammarFocus: ['Polite Subjunctive (Könnten Sie)', 'Connectors (obwohl, trotzdem)'],
    vocabularyTheme: 'Technology, Complaints, Service',
    missionType: 'Negotiation'
  },
  {
    id: 'B1.3',
    level: GermanLevel.B1,
    title: 'Traffic & Driving',
    description: 'Get a driver\'s license and understand rules.',
    grammarFocus: ['Passive Voice (Present)', 'Imperative (Review)'],
    vocabularyTheme: 'Cars, Traffic, Rules',
    missionType: 'Puzzle'
  },
  {
    id: 'B1.4',
    level: GermanLevel.B1,
    title: 'The Environment',
    description: 'Discuss recycling and sustainability.',
    grammarFocus: ['Future I (Predictions)', 'Verbs with Prepositions'],
    vocabularyTheme: 'Nature, Recycling, Environment',
    missionType: 'Investigation'
  },
  {
    id: 'B1.5',
    level: GermanLevel.B1,
    title: 'Movie Night',
    description: 'Review a film and express opinions.',
    grammarFocus: ['Relative Clauses (Nom/Acc)', 'Adjectives as Nouns'],
    vocabularyTheme: 'Cinema, Genre, Critique',
    missionType: 'Roleplay'
  },
  {
    id: 'B1.6',
    level: GermanLevel.B1,
    title: 'Tech Support',
    description: 'Help a colleague fix a software issue.',
    grammarFocus: ['Technical Instructions', 'Passive (State vs Process)'],
    vocabularyTheme: 'Computers, Software, Instructions',
    missionType: 'Roleplay'
  },
  {
    id: 'B1.7',
    level: GermanLevel.B1,
    title: 'Relationship Advice',
    description: 'Give advice to a heartbroken friend.',
    grammarFocus: ['Reciprocal Verbs', 'Connectors (während, bevor)'],
    vocabularyTheme: 'Emotions, Relationships, Advice',
    missionType: 'Roleplay'
  },
  {
    id: 'B1.8',
    level: GermanLevel.B1,
    title: 'The News',
    description: 'Discuss a current event from the Tagesschau.',
    grammarFocus: ['Passive Voice (Past)', 'N-Declension'],
    vocabularyTheme: 'Media, Politics, Society',
    missionType: 'Investigation'
  },
  {
    id: 'B1.9',
    level: GermanLevel.B1,
    title: 'Dreaming Big',
    description: 'What would you do if you won the lottery?',
    grammarFocus: ['Konjunktiv II (Wishes/Hypothetical)', 'Genitive (Intro)'],
    vocabularyTheme: 'Dreams, Money, Luck',
    missionType: 'Roleplay'
  },
  {
    id: 'B1.10',
    level: GermanLevel.B1,
    title: 'Fitness & Health',
    description: 'Join a gym and discuss nutrition.',
    grammarFocus: ['Genitive Prepositions (wegen, trotz)', 'Comparisons'],
    vocabularyTheme: 'Sports, Nutrition, Health',
    missionType: 'Roleplay'
  },
  {
    id: 'B1.11',
    level: GermanLevel.B1,
    title: 'History Museum',
    description: 'Learn about the Berlin Wall.',
    grammarFocus: ['Präteritum (Narrative)', 'Temporal Connectors'],
    vocabularyTheme: 'History, War, Culture',
    missionType: 'Investigation'
  },
  {
    id: 'B1.12',
    level: GermanLevel.B1,
    title: 'Dinner Debate',
    description: 'Have a heated discussion about politics.',
    grammarFocus: ['Argumentation Structure', 'Emphasis particles'],
    vocabularyTheme: 'Debate, Opinions, Politics',
    missionType: 'Negotiation'
  },

  // --- B2: THE PROFESSIONAL (Nuance) ---
  {
    id: 'B2.1',
    level: GermanLevel.B2,
    title: 'University Life',
    description: 'Navigate enrollment and bureaucracy.',
    grammarFocus: ['Nominalization', 'Passive with Modals'],
    vocabularyTheme: 'University, Bureaucracy, Studies',
    missionType: 'Investigation'
  },
  {
    id: 'B2.2',
    level: GermanLevel.B2,
    title: 'The Rental Contract',
    description: 'Understand legal terms in a lease.',
    grammarFocus: ['Participles as Adjectives', 'Legal German Basics'],
    vocabularyTheme: 'Housing, Law, Contracts',
    missionType: 'Puzzle'
  },
  {
    id: 'B2.3',
    level: GermanLevel.B2,
    title: 'Business Presentation',
    description: 'Pitch a product to investors.',
    grammarFocus: ['Noun-Verb Connections', 'Formal Business Style'],
    vocabularyTheme: 'Business, Charts, Presentation',
    missionType: 'Roleplay'
  },
  {
    id: 'B2.4',
    level: GermanLevel.B2,
    title: 'The Accident',
    description: 'Report an accident to insurance.',
    grammarFocus: ['Past Perfect (Plusquamperfekt)', 'Causal Connectors'],
    vocabularyTheme: 'Insurance, Accident, Report',
    missionType: 'Investigation'
  },
  {
    id: 'B2.5',
    level: GermanLevel.B2,
    title: 'Cultural Stereotypes',
    description: 'Discuss German culture vs your own.',
    grammarFocus: ['Complex Connectors (je... desto)', 'Comparison'],
    vocabularyTheme: 'Culture, Society, Habits',
    missionType: 'Roleplay'
  },
  {
    id: 'B2.6',
    level: GermanLevel.B2,
    title: 'Climate Change',
    description: 'Debate renewable energy solutions.',
    grammarFocus: ['Scientific Vocabulary', 'Passive (Impersonal)'],
    vocabularyTheme: 'Science, Energy, Climate',
    missionType: 'Negotiation'
  },
  {
    id: 'B2.7',
    level: GermanLevel.B2,
    title: 'Film Festival',
    description: 'Analyze a complex German drama.',
    grammarFocus: ['Subjective Modals (soll/will)', 'Stylistic Devices'],
    vocabularyTheme: 'Arts, Cinema, Analysis',
    missionType: 'Roleplay'
  },
  {
    id: 'B2.8',
    level: GermanLevel.B2,
    title: 'Start-up Pitch',
    description: 'Negotiate funding for an app.',
    grammarFocus: ['Persuasive Language', 'Future II (Assumption)'],
    vocabularyTheme: 'Startups, Finance, Tech',
    missionType: 'Negotiation'
  },
  {
    id: 'B2.9',
    level: GermanLevel.B2,
    title: 'Literature Club',
    description: 'Discuss a short story by Kafka.',
    grammarFocus: ['Literary Past', 'Metaphors'],
    vocabularyTheme: 'Literature, Reading, Interpretation',
    missionType: 'Roleplay'
  },
  {
    id: 'B2.10',
    level: GermanLevel.B2,
    title: 'Politics Today',
    description: 'Analyze election results.',
    grammarFocus: ['Political Terminology', 'Indirect Speech'],
    vocabularyTheme: 'Elections, Parties, Government',
    missionType: 'Investigation'
  },
  {
    id: 'B2.11',
    level: GermanLevel.B2,
    title: 'Workplace Conflict',
    description: 'Mediate a dispute between colleagues.',
    grammarFocus: ['Diplomatic Language', 'Konjunktiv II (Politeness)'],
    vocabularyTheme: 'HR, Conflict, Resolution',
    missionType: 'Negotiation'
  },
  {
    id: 'B2.12',
    level: GermanLevel.B2,
    title: 'Future Tech',
    description: 'Speculate on AI and robots.',
    grammarFocus: ['Future II (Completed Future)', 'Abstract Nouns'],
    vocabularyTheme: 'AI, Technology, Future',
    missionType: 'Roleplay'
  },

  // --- C1: THE EXPERT (Academic) ---
  {
    id: 'C1.1',
    level: GermanLevel.C1,
    title: 'Academic Research',
    description: 'Defend your thesis methodology.',
    grammarFocus: ['Academic Style', 'Fixed Expressions'],
    vocabularyTheme: 'Research, Science, University',
    missionType: 'Roleplay'
  },
  {
    id: 'C1.2',
    level: GermanLevel.C1,
    title: 'Economic Crisis',
    description: 'Analyze inflation and market trends.',
    grammarFocus: ['Nominal Style', 'Complex Syntax'],
    vocabularyTheme: 'Economy, Finance, Markets',
    missionType: 'Investigation'
  },
  {
    id: 'C1.3',
    level: GermanLevel.C1,
    title: 'Courtroom Drama',
    description: 'Understand a legal verdict.',
    grammarFocus: ['Legalese', 'Gerundives (zu + participle)'],
    vocabularyTheme: 'Law, Court, Justice',
    missionType: 'Investigation'
  },
  {
    id: 'C1.4',
    level: GermanLevel.C1,
    title: 'Psychology',
    description: 'Discuss human behavior and bias.',
    grammarFocus: ['Nuanced Adjectives', 'Hypothetical Comparison'],
    vocabularyTheme: 'Psychology, Mind, Behavior',
    missionType: 'Roleplay'
  },
  {
    id: 'C1.5',
    level: GermanLevel.C1,
    title: 'Art History',
    description: 'Critique a painting at a gallery.',
    grammarFocus: ['Descriptive Eloquence', 'Color Symbolism'],
    vocabularyTheme: 'Art, History, Aesthetics',
    missionType: 'Roleplay'
  },
  {
    id: 'C1.6',
    level: GermanLevel.C1,
    title: 'Modern Ethics',
    description: 'Debate bioethics and genetics.',
    grammarFocus: ['Rhetorical Devices', 'Advanced Connectors'],
    vocabularyTheme: 'Ethics, Biology, Moral',
    missionType: 'Negotiation'
  },
  {
    id: 'C1.7',
    level: GermanLevel.C1,
    title: 'Journalism',
    description: 'Write a report using sources.',
    grammarFocus: ['Konjunktiv I (Indirect Speech)', 'Reporting Verbs'],
    vocabularyTheme: 'Journalism, Media, News',
    missionType: 'Roleplay'
  },
  {
    id: 'C1.8',
    level: GermanLevel.C1,
    title: 'Globalization',
    description: 'Discuss the pros and cons of global trade.',
    grammarFocus: ['Complex Sentence Structure', 'Prepositions (Genitive)'],
    vocabularyTheme: 'Trade, Global, Society',
    missionType: 'Negotiation'
  },
  {
    id: 'C1.9',
    level: GermanLevel.C1,
    title: 'German History',
    description: 'Deep dive into the 20th century.',
    grammarFocus: ['Historical Narrative', 'Passive Varieties'],
    vocabularyTheme: 'History, War, Politics',
    missionType: 'Investigation'
  },
  {
    id: 'C1.10',
    level: GermanLevel.C1,
    title: 'Scientific Abstract',
    description: 'Draft an abstract for a conference.',
    grammarFocus: ['Conciseness', 'Passive Construction'],
    vocabularyTheme: 'Science, Writing, Formal',
    missionType: 'Puzzle'
  },
  {
    id: 'C1.11',
    level: GermanLevel.C1,
    title: 'Negotiation Strategy',
    description: 'Close a high-stakes deal.',
    grammarFocus: ['Leverage Language', 'Impersonal Forms'],
    vocabularyTheme: 'Business, Strategy, Deal',
    missionType: 'Negotiation'
  },
  {
    id: 'C1.12',
    level: GermanLevel.C1,
    title: 'Poetry Analysis',
    description: 'Interpret a complex poem.',
    grammarFocus: ['Metaphor', 'Symbolism'],
    vocabularyTheme: 'Poetry, Emotion, Arts',
    missionType: 'Roleplay'
  },

  // --- C2: THE MASTER (Native-like) ---
  {
    id: 'C2.1',
    level: GermanLevel.C2,
    title: 'Bavarian Dialect',
    description: 'Understand a local in Munich.',
    grammarFocus: ['Dialect Features', 'Colloquialisms'],
    vocabularyTheme: 'Regional, Bavaria, Culture',
    missionType: 'Roleplay'
  },
  {
    id: 'C2.2',
    level: GermanLevel.C2,
    title: 'Urban Slang',
    description: 'Chat with youths in Berlin.',
    grammarFocus: ['Kiezdeutsch', 'Street Slang'],
    vocabularyTheme: 'Slang, Youth, Urban',
    missionType: 'Roleplay'
  },
  {
    id: 'C2.3',
    level: GermanLevel.C2,
    title: 'Political Rhetoric',
    description: 'Analyze a speech by the Chancellor.',
    grammarFocus: ['Rhetoric', 'Persuasion techniques'],
    vocabularyTheme: 'Politics, Speech, Power',
    missionType: 'Investigation'
  },
  {
    id: 'C2.4',
    level: GermanLevel.C2,
    title: 'German Philosophy',
    description: 'Read and discuss Kant or Hegel.',
    grammarFocus: ['Complex Argumentation', 'Philosophical Terms'],
    vocabularyTheme: 'Philosophy, Logic, Reason',
    missionType: 'Puzzle'
  },
  {
    id: 'C2.5',
    level: GermanLevel.C2,
    title: 'Classical Literature',
    description: 'Discuss Goethe\'s Faust.',
    grammarFocus: ['Archaic German', 'Poetic Forms'],
    vocabularyTheme: 'Literature, Classics, Drama',
    missionType: 'Roleplay'
  },
  {
    id: 'C2.6',
    level: GermanLevel.C2,
    title: 'Satire & Cabaret',
    description: 'Understand political humor.',
    grammarFocus: ['Irony', 'Sarcasm', 'Double Entendre'],
    vocabularyTheme: 'Humor, Satire, Politics',
    missionType: 'Roleplay'
  },
  {
    id: 'C2.7',
    level: GermanLevel.C2,
    title: 'Scientific Publication',
    description: 'Review a peer-reviewed article.',
    grammarFocus: ['Academic Standards', 'Citation Style'],
    vocabularyTheme: 'Science, Publishing, Research',
    missionType: 'Investigation'
  },
  {
    id: 'C2.8',
    level: GermanLevel.C2,
    title: 'Diplomatic Relations',
    description: 'Handle a diplomatic incident.',
    grammarFocus: ['Nuance', 'Protocol'],
    vocabularyTheme: 'Diplomacy, International, Crisis',
    missionType: 'Negotiation'
  },
  {
    id: 'C2.9',
    level: GermanLevel.C2,
    title: 'Legal Defense',
    description: 'Argue a constitutional case.',
    grammarFocus: ['Constitutional Law', 'Formal Argument'],
    vocabularyTheme: 'Law, Rights, Justice',
    missionType: 'Negotiation'
  },
  {
    id: 'C2.10',
    level: GermanLevel.C2,
    title: 'Swiss & Austrian',
    description: 'Understand Swiss and Austrian variations.',
    grammarFocus: ['Helvetisms', 'Austriacisms'],
    vocabularyTheme: 'Regional, DACH, Variation',
    missionType: 'Investigation'
  },
  {
    id: 'C2.11',
    level: GermanLevel.C2,
    title: 'Crisis Management',
    description: 'Lead a team through a disaster.',
    grammarFocus: ['Leadership Communication', 'Imperatives'],
    vocabularyTheme: 'Management, Crisis, Action',
    missionType: 'Roleplay'
  },
  {
    id: 'C2.12',
    level: GermanLevel.C2,
    title: 'The Masterpiece',
    description: 'Write a creative short story.',
    grammarFocus: ['Creative Writing', 'Style'],
    vocabularyTheme: 'Writing, Fiction, Art',
    missionType: 'Puzzle'
  }
];

export const INTERESTS_LIST = [
  'History & Heritage',
  'Food & Gastronomy',
  'Art & Architecture',
  'Nature & Hiking',
  'Nightlife & Clubbing',
  'Classical Music',
  'Football (Soccer)',
  'Local Traditions',
  'Sustainable Travel',
  'Literature & Philosophy',
  'Castles & Palaces',
  'Photography',
  'Train Travel',
  'Christmas Markets',
  'Modern Design',
  'Beer & Brewing',
  'Wine Regions',
  'Urban Exploration'
];
