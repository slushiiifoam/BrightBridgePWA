-- Create the moods table in Supabase
CREATE TABLE moods (
    id SERIAL PRIMARY KEY,
    mood TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX idx_moods_user_id ON moods(user_id);

-- Create an index on timestamp for time-based queries
CREATE INDEX idx_moods_timestamp ON moods(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to only see their own moods
CREATE POLICY "Users can only see their own moods" ON moods
    FOR ALL USING (auth.uid()::text = user_id);

-- Allow authenticated users to insert their own moods
CREATE POLICY "Users can insert their own moods" ON moods
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);