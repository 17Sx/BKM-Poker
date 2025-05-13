-- Create bankroll_stats table
CREATE TABLE IF NOT EXISTS bankroll_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    total_bankroll DECIMAL(10, 2) DEFAULT 0,
    monthly_profit DECIMAL(10, 2) DEFAULT 0,
    hours_played DECIMAL(10, 2) DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0,
    winning_sessions_percentage DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Enable RLS
ALTER TABLE bankroll_stats ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bankroll stats" ON bankroll_stats;
DROP POLICY IF EXISTS "Users can update their own bankroll stats" ON bankroll_stats;
DROP POLICY IF EXISTS "Users can insert their own bankroll stats" ON bankroll_stats;
-- Create new policies
CREATE POLICY "Users can view their own bankroll stats" ON bankroll_stats FOR
SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own bankroll stats" ON bankroll_stats FOR
UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bankroll stats" ON bankroll_stats FOR
INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = timezone('utc'::text, now());
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_bankroll_stats_updated_at BEFORE
UPDATE ON bankroll_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();