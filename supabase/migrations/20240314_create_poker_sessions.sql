-- Create poker_sessions table
CREATE TABLE IF NOT EXISTS poker_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    buy_in DECIMAL(10, 2) NOT NULL,
    cash_out DECIMAL(10, 2) NOT NULL,
    duration DECIMAL(5, 2) NOT NULL,
    notes TEXT,
    game_type VARCHAR(50),
    location VARCHAR(100),
    blinds VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Enable RLS
ALTER TABLE poker_sessions ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own poker sessions" ON poker_sessions;
DROP POLICY IF EXISTS "Users can update their own poker sessions" ON poker_sessions;
DROP POLICY IF EXISTS "Users can insert their own poker sessions" ON poker_sessions;
DROP POLICY IF EXISTS "Users can delete their own poker sessions" ON poker_sessions;
-- Create new policies
CREATE POLICY "Users can view their own poker sessions" ON poker_sessions FOR
SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own poker sessions" ON poker_sessions FOR
UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own poker sessions" ON poker_sessions FOR
INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own poker sessions" ON poker_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);
-- Create trigger for updated_at
CREATE TRIGGER update_poker_sessions_updated_at BEFORE
UPDATE ON poker_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();