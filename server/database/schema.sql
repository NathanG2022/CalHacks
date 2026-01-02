-- AI Safety Testing Webapp - Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Test Runs: Each multi-model test session
CREATE TABLE IF NOT EXISTS test_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  prompt TEXT NOT NULL,
  attack_method VARCHAR(100) NOT NULL, -- 'crescendo', 'direct_injection', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  total_models INT DEFAULT 0,
  completed_models INT DEFAULT 0,
  metadata JSONB -- Additional config like temperature, max_turns, etc.
);

-- Test Results: Individual model results within a test run
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  model_id VARCHAR(255) NOT NULL, -- 'Qwen/Qwen2.5-7B-Instruct', etc.
  attack_method VARCHAR(100) NOT NULL,
  success BOOLEAN NOT NULL, -- Did canary token appear?
  response_text TEXT,
  canary_detected BOOLEAN DEFAULT FALSE,
  canary_tokens JSONB, -- Array of detected tokens
  safety_score FLOAT, -- 0.0 - 1.0
  compliance_level FLOAT, -- 0.0 - 1.0
  refusal_detected BOOLEAN,
  response_time_ms INT,
  metadata JSONB, -- Full response analysis, turn-by-turn for Crescendo
  created_at TIMESTAMP DEFAULT NOW()
);

-- Statistics aggregation (denormalized for performance)
CREATE TABLE IF NOT EXISTS model_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id VARCHAR(255) UNIQUE NOT NULL,
  total_tests INT DEFAULT 0,
  successful_attacks INT DEFAULT 0, -- Tests where canary was detected
  failed_attacks INT DEFAULT 0,
  average_safety_score FLOAT,
  critical_vulnerabilities INT DEFAULT 0,
  high_vulnerabilities INT DEFAULT 0,
  medium_vulnerabilities INT DEFAULT 0,
  low_vulnerabilities INT DEFAULT 0,
  last_tested_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attack_method_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attack_method VARCHAR(100) UNIQUE NOT NULL,
  total_tests INT DEFAULT 0,
  successful_attacks INT DEFAULT 0,
  failed_attacks INT DEFAULT 0,
  success_rate FLOAT,
  average_response_time_ms INT,
  most_vulnerable_model VARCHAR(255),
  least_vulnerable_model VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_results_run_id ON test_results(test_run_id);
CREATE INDEX IF NOT EXISTS idx_test_results_model ON test_results(model_id);
CREATE INDEX IF NOT EXISTS idx_test_results_method ON test_results(attack_method);
CREATE INDEX IF NOT EXISTS idx_test_runs_user ON test_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_created ON test_runs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own test runs" ON test_runs;
DROP POLICY IF EXISTS "Users can insert own test runs" ON test_runs;
DROP POLICY IF EXISTS "Users can view test results" ON test_results;

-- Users can only see their own test runs
CREATE POLICY "Users can view own test runs" ON test_runs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test runs" ON test_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test runs" ON test_runs
  FOR UPDATE USING (auth.uid() = user_id);

-- Test results inherit permissions from test_runs
CREATE POLICY "Users can view test results" ON test_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM test_runs
      WHERE test_runs.id = test_results.test_run_id
      AND test_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert test results" ON test_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_runs
      WHERE test_runs.id = test_results.test_run_id
      AND test_runs.user_id = auth.uid()
    )
  );

-- Model statistics are publicly readable (no user_id)
ALTER TABLE model_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Model statistics are publicly readable" ON model_statistics
  FOR SELECT USING (true);

-- Attack method statistics are publicly readable (no user_id)
ALTER TABLE attack_method_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attack method statistics are publicly readable" ON attack_method_statistics
  FOR SELECT USING (true);

-- Allow system to update statistics (use service role key)
CREATE POLICY "System can upsert model statistics" ON model_statistics
  FOR ALL USING (true);

CREATE POLICY "System can upsert attack method statistics" ON attack_method_statistics
  FOR ALL USING (true);
