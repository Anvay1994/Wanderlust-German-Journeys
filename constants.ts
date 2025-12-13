import { CurriculumModule, GermanLevel } from './types';

// THE BACKBONE: 6 Levels x 6 Modules = 36 Missions
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
    title: 'Hunger & Thirst',
    description: 'Order food at a Berlin Café. Learn to say what you would like.',
    grammarFocus: ['Accusative Case (Basic)', 'Möchten (Would like)', 'Plurals'],
    vocabularyTheme: 'Food, Drinks, Numbers, Prices',
    missionType: 'Roleplay'
  },
  {
    id: 'A1.3',
    level: GermanLevel.A1,
    title: 'City Explorer',
    description: 'Ask for directions in Munich. Navigate the U-Bahn.',
    grammarFocus: ['Imperative (Simple)', 'W-Questions', 'Prepositions (in, nach)'],
    vocabularyTheme: 'Transport, Directions, Places',
    missionType: 'Investigation'
  },
  {
    id: 'A1.4',
    level: GermanLevel.A1,
    title: 'Hotel Trouble',
    description: 'Check into a hotel in Hamburg and complain about a missing towel.',
    grammarFocus: ['Negation (nicht/kein)', 'Definite vs Indefinite Articles'],
    vocabularyTheme: 'Hotel, Complaints, Needs',
    missionType: 'Roleplay'
  },
  {
    id: 'A1.5',
    level: GermanLevel.A1,
    title: 'Shopping Spree',
    description: 'Buy a souvenir in Cologne. Discuss colors and sizes.',
    grammarFocus: ['Adjectives (Predicative)', 'Demonstratives (dieser/welcher)'],
    vocabularyTheme: 'Clothing, Colors, Souvenirs',
    missionType: 'Negotiation'
  },
  {
    id: 'A1.6',
    level: GermanLevel.A1,
    title: 'New Friends',
    description: 'Meet locals in a park. Talk about your hobbies and family.',
    grammarFocus: ['Possessive Articles', 'Separable Verbs Intro'],
    vocabularyTheme: 'Family, Hobbies, Days of Week',
    missionType: 'Roleplay'
  },

  // --- A2: THE RESIDENT (Daily Life) ---
  {
    id: 'A2.1',
    level: GermanLevel.A2,
    title: 'Apartment Hunting',
    description: 'View an apartment in Berlin. Discuss rooms and furniture.',
    grammarFocus: ['Two-Way Prepositions (Wechselpräpositionen)', 'Dative Case Intro'],
    vocabularyTheme: 'Housing, Furniture, Locations',
    missionType: 'Investigation'
  },
  {
    id: 'A2.2',
    level: GermanLevel.A2,
    title: 'At the Doctor',
    description: 'Visit a pharmacy or doctor. Describe your symptoms.',
    grammarFocus: ['Modal Verbs (müssen, können, dürfen)', 'Imperative (Formal)'],
    vocabularyTheme: 'Body, Health, Medicine',
    missionType: 'Roleplay'
  },
  {
    id: 'A2.3',
    level: GermanLevel.A2,
    title: 'The Weekend Trip',
    description: 'Plan a hiking trip to the Black Forest. Check the weather.',
    grammarFocus: ['Future I (werden)', 'Comparatives (besser, schneller)'],
    vocabularyTheme: 'Nature, Weather, Travel Plans',
    missionType: 'Puzzle'
  },
  {
    id: 'A2.4',
    level: GermanLevel.A2,
    title: 'Buying a Ticket',
    description: 'Navigate a complex train schedule at the Hauptbahnhof.',
    grammarFocus: ['Time Expressions', 'Separable Verbs (Complex)'],
    vocabularyTheme: 'Train Travel, Schedules, Time',
    missionType: 'Investigation'
  },
  {
    id: 'A2.5',
    level: GermanLevel.A2,
    title: 'Yesterday',
    description: 'Tell a friend what you did yesterday over coffee.',
    grammarFocus: ['Perfect Tense (haben vs sein)', 'Participle II'],
    vocabularyTheme: 'Activities, Storytelling, Past Events',
    missionType: 'Roleplay'
  },
  {
    id: 'A2.6',
    level: GermanLevel.A2,
    title: 'The Invitation',
    description: 'Coordinate a dinner party. Accept or decline invitations.',
    grammarFocus: ['Dative Verbs (helfen, danken)', 'Personal Pronouns (Dative)'],
    vocabularyTheme: 'Celebrations, Gifts, Socializing',
    missionType: 'Negotiation'
  },

  // --- B1: THE LOCAL (Independent) ---
  {
    id: 'B1.1',
    level: GermanLevel.B1,
    title: 'Job Interview',
    description: 'Apply for a part-time job. Discuss your skills and experience.',
    grammarFocus: ['Subordinate Clauses (weil, dass)', 'Simple Past (Präteritum) - Modals'],
    vocabularyTheme: 'Work, CV, Skills',
    missionType: 'Roleplay'
  },
  {
    id: 'B1.2',
    level: GermanLevel.B1,
    title: 'Problem Solver',
    description: 'Call customer service about a broken internet connection.',
    grammarFocus: ['Connectors (obwohl, trotzdem)', 'Polite Subjunctive (Könnten Sie...)'],
    vocabularyTheme: 'Technology, Service, Problems',
    missionType: 'Negotiation'
  },
  {
    id: 'B1.3',
    level: GermanLevel.B1,
    title: 'Relationship Talk',
    description: 'Give advice to a friend with relationship trouble.',
    grammarFocus: ['Reflexive Verbs', 'Verbs with Prepositions (warten auf)'],
    vocabularyTheme: 'Emotions, Relationships, Advice',
    missionType: 'Roleplay'
  },
  {
    id: 'B1.4',
    level: GermanLevel.B1,
    title: 'Future Dreams',
    description: 'Discuss what you would do if you won the lottery.',
    grammarFocus: ['Konjunktiv II (würde/hätte)', 'Genitive Case Intro'],
    vocabularyTheme: 'Ambitions, Dreams, Hypotheticals',
    missionType: 'Roleplay'
  },
  {
    id: 'B1.5',
    level: GermanLevel.B1,
    title: 'The News',
    description: 'Discuss a current event or news article with a colleague.',
    grammarFocus: ['Passive Voice (Vorgangspassiv)', 'Relative Clauses'],
    vocabularyTheme: 'Media, Politics, Society',
    missionType: 'Investigation'
  },
  {
    id: 'B1.6',
    level: GermanLevel.B1,
    title: 'Active Life',
    description: 'Join a sports club or gym. Understand the rules.',
    grammarFocus: ['Infinitives with "zu"', 'Adjective Endings (Advanced)'],
    vocabularyTheme: 'Sports, Rules, Health',
    missionType: 'Puzzle'
  },

  // --- B2: THE PROFESSIONAL (Nuance) ---
  {
    id: 'B2.1',
    level: GermanLevel.B2,
    title: 'University Life',
    description: 'Navigate university bureaucracy and enrollment.',
    grammarFocus: ['Passive with Modals', 'Nominalization'],
    vocabularyTheme: 'University, Bureaucracy, Education',
    missionType: 'Investigation'
  },
  {
    id: 'B2.2',
    level: GermanLevel.B2,
    title: 'Debate Club',
    description: 'Argue for or against renewable energy.',
    grammarFocus: ['Complex Connectors (je... desto)', 'Argumentation Structure'],
    vocabularyTheme: 'Environment, Debate, Opinions',
    missionType: 'Negotiation'
  },
  {
    id: 'B2.3',
    level: GermanLevel.B2,
    title: 'Cultural History',
    description: 'Explain the history of the Berlin Wall to a tourist.',
    grammarFocus: ['Past Perfect (Plusquamperfekt)', 'Historical Narrative'],
    vocabularyTheme: 'History, Politics, Conflict',
    missionType: 'Roleplay'
  },
  {
    id: 'B2.4',
    level: GermanLevel.B2,
    title: 'Business Pitch',
    description: 'Present a new product idea to investors.',
    grammarFocus: ['Participial Constructions', 'Formal Business German'],
    vocabularyTheme: 'Business, Marketing, Innovation',
    missionType: 'Roleplay'
  },
  {
    id: 'B2.5',
    level: GermanLevel.B2,
    title: 'The Complaint',
    description: 'Write a formal complaint letter about a defective product.',
    grammarFocus: ['N-Declension', 'Formal Correspondence'],
    vocabularyTheme: 'Consumer Rights, Law, Formalities',
    missionType: 'Negotiation'
  },
  {
    id: 'B2.6',
    level: GermanLevel.B2,
    title: 'Film Critics',
    description: 'Analyze a German film\'s plot and themes.',
    grammarFocus: ['Subjective Use of Modals', 'Indirect Speech'],
    vocabularyTheme: 'Cinema, Arts, Critique',
    missionType: 'Roleplay'
  },

  // --- C1: THE EXPERT (Academic) ---
  {
    id: 'C1.1',
    level: GermanLevel.C1,
    title: 'Research Project',
    description: 'Discuss research methodology with a professor.',
    grammarFocus: ['Academic Passive Forms', 'Fixed Expressions'],
    vocabularyTheme: 'Science, Research, Methodology',
    missionType: 'Roleplay'
  },
  {
    id: 'C1.2',
    level: GermanLevel.C1,
    title: 'Economic Forum',
    description: 'Analyze market trends and inflation.',
    grammarFocus: ['Nominal Style', 'Complex Syntax'],
    vocabularyTheme: 'Economy, Finance, Trends',
    missionType: 'Investigation'
  },
  {
    id: 'C1.3',
    level: GermanLevel.C1,
    title: 'Legal Trouble',
    description: 'Understand a rental contract and legal rights.',
    grammarFocus: ['Legalese', 'Gerundives'],
    vocabularyTheme: 'Law, Contracts, Rights',
    missionType: 'Puzzle'
  },
  {
    id: 'C1.4',
    level: GermanLevel.C1,
    title: 'Psychology',
    description: 'Discuss human behavior and sociology.',
    grammarFocus: ['Hypothetical Comparisons', 'Nuanced Adjectives'],
    vocabularyTheme: 'Psychology, Sociology, Behavior',
    missionType: 'Roleplay'
  },
  {
    id: 'C1.5',
    level: GermanLevel.C1,
    title: 'Literature Circle',
    description: 'Interpret a poem by Goethe or Rilke.',
    grammarFocus: ['Poetic Devices', 'Archaic Forms'],
    vocabularyTheme: 'Literature, Poetry, Analysis',
    missionType: 'Roleplay'
  },
  {
    id: 'C1.6',
    level: GermanLevel.C1,
    title: 'Tech Ethics',
    description: 'Debate the ethics of AI and automation.',
    grammarFocus: ['Rhetorical Devices', 'Advanced Connectors'],
    vocabularyTheme: 'Technology, Ethics, Future',
    missionType: 'Negotiation'
  },

  // --- C2: THE MASTER (Native-like) ---
  {
    id: 'C2.1',
    level: GermanLevel.C2,
    title: 'Dialects',
    description: 'Understand and interact with Bavarian or Saxon dialects.',
    grammarFocus: ['Regional Variations', 'Colloquialisms'],
    vocabularyTheme: 'Dialects, Regional Culture',
    missionType: 'Roleplay'
  },
  {
    id: 'C2.2',
    level: GermanLevel.C2,
    title: 'Political Speech',
    description: 'Analyze rhetoric in a political speech.',
    grammarFocus: ['Stylistic Devices', 'Advanced Rhetoric'],
    vocabularyTheme: 'Politics, Rhetoric, Persuasion',
    missionType: 'Investigation'
  },
  {
    id: 'C2.3',
    level: GermanLevel.C2,
    title: 'Satire & Humor',
    description: 'Understand German Kabarett and political satire.',
    grammarFocus: ['Irony', 'Sarcasm', 'Wordplay'],
    vocabularyTheme: 'Humor, Satire, Culture',
    missionType: 'Puzzle'
  },
  {
    id: 'C2.4',
    level: GermanLevel.C2,
    title: 'Scientific Paper',
    description: 'Draft an abstract for a scientific conference.',
    grammarFocus: ['Scientific Writing', 'Conciseness'],
    vocabularyTheme: 'Science, Publication, Academia',
    missionType: 'Roleplay'
  },
  {
    id: 'C2.5',
    level: GermanLevel.C2,
    title: 'Philosophy',
    description: 'Discuss Kant or Nietzsche.',
    grammarFocus: ['Philosophical Terminology', 'Complex Argumentation'],
    vocabularyTheme: 'Philosophy, Logic, Existence',
    missionType: 'Roleplay'
  },
  {
    id: 'C2.6',
    level: GermanLevel.C2,
    title: 'Total Fluency',
    description: 'Manage a crisis situation with high-stress communication.',
    grammarFocus: ['Nuance', 'Tone Control'],
    vocabularyTheme: 'Crisis Management, Leadership',
    missionType: 'Negotiation'
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