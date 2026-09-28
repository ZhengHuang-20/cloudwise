-- 云端智荐 (Cloud Wisdom) Supabase Database Schema
-- Run this in your Supabase SQL Editor if you are using Supabase Cloud

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  company_name TEXT,
  industry TEXT,
  role TEXT DEFAULT '业务负责人',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Course Progress Table
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  quiz_score INT DEFAULT 100,
  exercise_data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id, lesson_id)
);

-- 3. Diagnosis Records Table
CREATE TABLE IF NOT EXISTS public.diagnosis_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  score INT,
  summary TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Saved Proposals Table
CREATE TABLE IF NOT EXISTS public.saved_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  services JSONB NOT NULL,
  timeline TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Leads Table (MQL/SQL Scoring for Pre-Sales)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  industry TEXT,
  mql_score INT DEFAULT 0,
  stage TEXT DEFAULT '已识别', -- '陌生访客', '已识别', '已诊断', 'MQL', 'SQL', '商机', '签约与交接'
  friction_points JSONB,
  crm_card JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_proposals ENABLE ROW LEVEL SECURITY;

-- Setup public read/write policies for authenticated users
CREATE POLICY "Users can manage their own profile" 
ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own learning progress" 
ON public.course_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their diagnosis records" 
ON public.diagnosis_records FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their proposals" 
ON public.saved_proposals FOR ALL USING (auth.uid() = user_id);
