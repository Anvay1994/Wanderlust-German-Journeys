import React from 'react';

export const SUPABASE_SCHEMA_SQL = `
-- ==========================================
-- 1. SETUP & EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security (RLS) is done per table below

-- Create custom types
DO $$ BEGIN
    CREATE TYPE german_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mission_type AS ENUM ('Roleplay', 'Investigation', 'Puzzle', 'Negotiation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    current_level german_level DEFAULT 'A1',
    credits INTEGER DEFAULT 100,
    xp INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 1,
    interests TEXT[] DEFAULT '{}',
    completed_modules TEXT[] DEFAULT '{}',
    unlocked_modules TEXT[] DEFAULT '{"A1.1", "A1.2", "A1.3", "A1.4", "A1.5", "A1.6"}',
    owned_levels german_level[] DEFAULT '{}',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Transactions table for purchases and credits
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    amount_inr NUMERIC(10, 2) DEFAULT 0,
    amount_credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Curriculum modules table (static data)
CREATE TABLE IF NOT EXISTS curriculum_modules (
    id TEXT PRIMARY KEY,
    level german_level NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    grammar_focus TEXT[] DEFAULT '{}',
    vocabulary_theme TEXT NOT NULL,
    mission_type mission_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User progress on specific modules (optional, for detailed tracking)
CREATE TABLE IF NOT EXISTS user_module_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    module_id TEXT REFERENCES curriculum_modules(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')) DEFAULT 'not_started',
    xp_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, module_id)
);

-- ==========================================
-- 3. POLICIES (Row Level Security)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE curriculum_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read curriculum" ON curriculum_modules FOR SELECT USING (true);

ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON user_module_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_module_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_module_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 4. TRIGGERS & FUNCTIONS
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_module_progress_updated_at ON user_module_progress;
CREATE TRIGGER update_user_module_progress_updated_at
    BEFORE UPDATE ON user_module_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 5. DATA (Curriculum - Truncated for View)
-- ==========================================

INSERT INTO curriculum_modules (id, level, title, description, grammar_focus, vocabulary_theme, mission_type)
VALUES 
('A1.1', 'A1', 'The Arrival', 'Land in Frankfurt. Handle passport control and introduce yourself.', ARRAY['Sein/Haben', 'Regular Verbs', 'Personal Pronouns'], 'Greetings, Countries, Occupations', 'Roleplay'),
('A1.2', 'A1', 'Hotel Check-in', 'Check into your hotel. Spell your name and fill out forms.', ARRAY['The Alphabet', 'Spelling', 'Numbers 0-100'], 'Personal Data, Forms, Hotel', 'Roleplay'),
('A1.3', 'A1', 'Hunger & Thirst', 'Order food at a Café. Learn to say what you would like.', ARRAY['Accusative Case (Basic)', 'Möchten (Would like)', 'Plurals'], 'Food, Drinks, Prices', 'Roleplay'),
('A1.4', 'A1', 'The Supermarket', 'Buy groceries for a picnic. Ask for items.', ARRAY['Definite vs Indefinite Articles', 'Negation (kein)'], 'Groceries, Fruits, Vegetables', 'Investigation'),
('A1.5', 'A1', 'City Explorer', 'Ask for directions in Munich. Navigate the streets.', ARRAY['Imperative (Simple)', 'W-Questions', 'Prepositions (in, nach)'], 'Directions, Places, City', 'Investigation'),
('A1.6', 'A1', 'Public Transport', 'Buy a U-Bahn ticket and understand the schedule.', ARRAY['Time Expressions', 'Modal Verbs (können/müssen)'], 'Transport, Time, Tickets', 'Puzzle'),
('A1.7', 'A1', 'My Family', 'Show a photo of your family and describe them.', ARRAY['Possessive Articles (mein, dein)', 'Ja/Nein Questions'], 'Family, Relationships, Ages', 'Roleplay'),
('A1.8', 'A1', 'Daily Routine', 'Describe your day to a new friend.', ARRAY['Separable Verbs', 'Word Order (Time before Place)'], 'Routine, Verbs, Times of Day', 'Roleplay'),
('A1.9', 'A1', 'Shopping Spree', 'Buy a souvenir in Cologne. Discuss colors and sizes.', ARRAY['Adjectives (Predicative)', 'Demonstratives (dieser)'], 'Clothing, Colors, Souvenirs', 'Negotiation'),
('A1.10', 'A1', 'The Weather', 'Plan a trip based on the forecast.', ARRAY['Es gibt', 'Impersonal Verbs'], 'Weather, Seasons, Months', 'Puzzle'),
('A1.11', 'A1', 'Free Time', 'Discuss hobbies and arrange a meeting.', ARRAY['Verbs with Accusative', 'Word Order Inversion'], 'Hobbies, Sports, Leisure', 'Roleplay'),
('A1.12', 'A1', 'Postcard Home', 'Write about what you have done so far.', ARRAY['Perfect Tense (Introduction)', 'Participle II'], 'Travel Activities, Adjectives', 'Investigation'),
('A2.1', 'A2', 'Apartment Hunting', 'View an apartment in Berlin. Discuss rooms.', ARRAY['Prepositions with Dative', 'There is/are'], 'Housing, Furniture, Rooms', 'Investigation'),
('A2.2', 'A2', 'Furniture Shopping', 'Furnish your new room. Compare items.', ARRAY['Adjective Endings (Definite)', 'Comparative'], 'Furniture, Materials, Describing', 'Negotiation'),
('A2.3', 'A2', 'Restaurant Booking', 'Make a reservation by phone for a group.', ARRAY['Modal Verbs (Past/Präteritum)', 'Polite Requests'], 'Restaurant, Telephoning, Dining', 'Roleplay'),
('A2.4', 'A2', 'At the Doctor', 'Visit a doctor. Describe your symptoms.', ARRAY['Imperative (Formal)', 'Reflexive Verbs (Body)'], 'Body, Health, Illness', 'Roleplay'),
('A2.5', 'A2', 'Train Travel', 'Navigate a delay and change trains.', ARRAY['Connectors (und, oder, aber)', 'Future (werden)'], 'Travel, Delays, Stations', 'Puzzle'),
('A2.6', 'A2', 'Post Office & Bank', 'Open a bank account and mail a package.', ARRAY['Dative Verbs', 'Ordinal Numbers'], 'Service, Banking, Mail', 'Investigation'),
('A2.7', 'A2', 'Weekend Trip', 'Tell a story about your hiking trip.', ARRAY['Perfect Tense (Motion vs State)', 'Time Adverbs'], 'Nature, Hiking, Activities', 'Roleplay'),
('A2.8', 'A2', 'Birthday Party', 'Buy a gift and accept an invitation.', ARRAY['Personal Pronouns (Dative)', 'Prepositions (für, ohne)'], 'Celebrations, Gifts, Dates', 'Negotiation'),
('A2.9', 'A2', 'Fashion & Style', 'Give advice on what to wear.', ARRAY['Superlative', 'Adjective Endings (Indefinite)'], 'Fashion, Looks, Opinions', 'Roleplay'),
('A2.10', 'A2', 'Job Hunt', 'Read job ads and understand requirements.', ARRAY['Modal Verbs (Meaning nuances)', 'Compound Nouns'], 'Work, Tasks, Professions', 'Investigation'),
('A2.11', 'A2', 'School Memories', 'Talk about your childhood.', ARRAY['Simple Past (Präteritum - war/hatte)', 'Subordinate (als, wenn)'], 'School, Childhood, Past', 'Roleplay'),
('A2.12', 'A2', 'Neighborhood Gossip', 'Chat with a neighbor about the community.', ARRAY['Reflexive Verbs (Acc/Dat)', 'Question Words (Worauf, Womit)'], 'Community, Gossip, Daily Life', 'Roleplay')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    grammar_focus = EXCLUDED.grammar_focus,
    vocabulary_theme = EXCLUDED.vocabulary_theme,
    mission_type = EXCLUDED.mission_type;
`;

const DatabaseSchemaViewer: React.FC = () => {
  return (
    <div className="p-8 bg-stone-900 text-stone-200 min-h-screen font-mono text-xs overflow-auto">
       <h1 className="text-xl text-[#059669] font-bold mb-4">Supabase Database Configuration</h1>
       <p className="mb-4 text-stone-400">Run this SQL in your Supabase SQL Editor to configure the complete backend schema.</p>
       <textarea 
         readOnly 
         className="w-full h-[80vh] bg-black p-4 rounded border border-stone-700 focus:outline-none focus:border-[#059669]"
         value={SUPABASE_SCHEMA_SQL} 
       />
    </div>
  );
};

export default DatabaseSchemaViewer;
