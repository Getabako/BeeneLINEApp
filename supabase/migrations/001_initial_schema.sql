-- BeeneStyle LINE AI System - Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- users テーブル
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_user_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  membership TEXT NOT NULL DEFAULT 'free' CHECK (membership IN ('free', 'paid')),
  age INT,
  gender TEXT,
  height FLOAT,
  weight FLOAT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_line_user_id ON users(line_user_id);

-- ============================================
-- conversation_states テーブル
-- ============================================
CREATE TABLE conversation_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_user_id TEXT NOT NULL REFERENCES users(line_user_id) ON DELETE CASCADE,
  current_flow TEXT NOT NULL DEFAULT 'idle'
    CHECK (current_flow IN ('idle', 'skin_diagnosis', 'health_diagnosis', 'meal_analysis', 'daily_report', 'reservation')),
  step INT NOT NULL DEFAULT 0,
  context JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_conversation_states_line_user_id ON conversation_states(line_user_id);

-- ============================================
-- skin_logs テーブル
-- ============================================
CREATE TABLE skin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_user_id TEXT NOT NULL REFERENCES users(line_user_id) ON DELETE CASCADE,
  skin_age INT,
  moisture_score INT CHECK (moisture_score BETWEEN 0 AND 100),
  spots_level TEXT,
  sagging_level TEXT,
  face_shape TEXT,
  overall_score INT CHECK (overall_score BETWEEN 0 AND 100),
  image_url TEXT,
  raw_analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skin_logs_line_user_id ON skin_logs(line_user_id);

-- ============================================
-- meal_logs テーブル
-- ============================================
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_user_id TEXT NOT NULL REFERENCES users(line_user_id) ON DELETE CASCADE,
  calories INT,
  protein FLOAT,
  fat FLOAT,
  carbs FLOAT,
  food_items JSONB,
  warmth_score INT,
  digestion_score INT,
  hydration_score INT,
  advice TEXT,
  meal_time TIMESTAMPTZ,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_logs_line_user_id ON meal_logs(line_user_id);

-- ============================================
-- daily_reports テーブル
-- ============================================
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_user_id TEXT NOT NULL REFERENCES users(line_user_id) ON DELETE CASCADE,
  weight FLOAT,
  sleep_hours FLOAT,
  water_intake FLOAT,
  bowel TEXT,
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_daily_reports_line_user_id ON daily_reports(line_user_id);

-- ============================================
-- before_after テーブル
-- ============================================
CREATE TABLE before_after (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('skin', 'weight', 'body')),
  concern_type TEXT,
  age_range TEXT CHECK (age_range IN ('20s', '30s', '40s', '50s', '60s')),
  before_description TEXT,
  after_description TEXT,
  improvement_data JSONB,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- reservations テーブル
-- ============================================
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_user_id TEXT NOT NULL REFERENCES users(line_user_id) ON DELETE CASCADE,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  menu_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reservations_line_user_id ON reservations(line_user_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);

-- ============================================
-- updated_at 自動更新トリガー
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_conversation_states_updated_at
  BEFORE UPDATE ON conversation_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
