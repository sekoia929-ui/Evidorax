-- EvidoraX Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  plan TEXT DEFAULT 'free', -- free, starter, researcher, institution
  papers_used INTEGER DEFAULT 0,
  papers_limit INTEGER DEFAULT 5, -- free = 5 lifetime
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table (group of papers)
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  topic TEXT, -- e.g. "BCG Vaccine TB Prevention"
  paper_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Papers table (uploaded PDFs)
CREATE TABLE public.papers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- path in Supabase Storage
  file_size_bytes INTEGER,
  status TEXT DEFAULT 'uploaded', -- uploaded, parsing, extracting, verifying, complete, error
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extractions table (Stage 1 raw dump)
CREATE TABLE public.extractions_raw (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE UNIQUE,
  raw_text TEXT, -- parsed PDF text
  stage1_output TEXT, -- giant extractor output
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extractions structured table (Stage 2 JSON)
CREATE TABLE public.extractions_structured (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE UNIQUE,

  -- Study Info
  title TEXT,
  authors TEXT,
  year TEXT,
  journal TEXT,
  study_design TEXT,
  country TEXT,
  funding_source TEXT,

  -- PICO - Population
  population_description TEXT,
  population_age_range TEXT,
  population_sample_size TEXT,
  population_inclusion TEXT,
  population_exclusion TEXT,

  -- PICO - Intervention
  intervention_name TEXT,
  intervention_dose TEXT,
  intervention_route TEXT,
  intervention_duration TEXT,
  intervention_frequency TEXT,

  -- PICO - Comparator
  comparator_type TEXT,
  comparator_description TEXT,

  -- PICO - Outcome
  outcome_primary TEXT,
  outcome_secondary TEXT,
  outcome_followup TEXT,
  outcome_tool TEXT,

  -- Raw Data
  n_treatment TEXT,
  n_control TEXT,
  events_treatment TEXT,
  events_control TEXT,
  effect_measure_type TEXT,
  effect_size TEXT,
  ci_lower TEXT,
  ci_upper TEXT,
  p_value TEXT,
  subgroup TEXT,

  -- GRADE
  grade_risk_of_bias_score TEXT,
  grade_risk_of_bias_reason TEXT,
  grade_risk_of_bias_source TEXT,
  grade_inconsistency_score TEXT,
  grade_inconsistency_reason TEXT,
  grade_inconsistency_source TEXT,
  grade_indirectness_score TEXT,
  grade_indirectness_reason TEXT,
  grade_indirectness_source TEXT,
  grade_imprecision_score TEXT,
  grade_imprecision_reason TEXT,
  grade_imprecision_source TEXT,
  grade_publication_bias_score TEXT,
  grade_publication_bias_reason TEXT,
  grade_publication_bias_source TEXT,
  grade_overall TEXT,

  -- Flags
  fields_not_found JSONB DEFAULT '[]',
  fields_needing_review JSONB DEFAULT '[]',
  extractor_confidence TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification table (Pass 3)
CREATE TABLE public.verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE UNIQUE,
  verification_report JSONB, -- full Pass 3 output
  total_fields INTEGER,
  verified_count INTEGER,
  inferred_count INTEGER,
  contradicted_count INTEGER,
  unverifiable_count INTEGER,
  accuracy_rate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Human review corrections
CREATE TABLE public.corrections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  original_value TEXT,
  corrected_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE public.usage_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE,
  api_calls INTEGER DEFAULT 3, -- 3 Claude calls per paper
  estimated_cost_usd NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extractions_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extractions_structured ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their own data)
CREATE POLICY "Users can view own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own papers" ON public.papers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own extractions raw" ON public.extractions_raw FOR ALL
  USING (paper_id IN (SELECT id FROM public.papers WHERE user_id = auth.uid()));
CREATE POLICY "Users can view own extractions structured" ON public.extractions_structured FOR ALL
  USING (paper_id IN (SELECT id FROM public.papers WHERE user_id = auth.uid()));
CREATE POLICY "Users can view own verifications" ON public.verifications FOR ALL
  USING (paper_id IN (SELECT id FROM public.papers WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own corrections" ON public.corrections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage" ON public.usage_log FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('papers', 'papers', false);
CREATE POLICY "Users can upload own papers" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'papers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own papers" ON storage.objects FOR SELECT
  USING (bucket_id = 'papers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
