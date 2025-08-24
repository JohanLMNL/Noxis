// Script pour créer automatiquement les tables Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ooishzluwsqgluzykapy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaXNoemx1d3NxZ2x1enlrYXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNDMzMTUsImV4cCI6MjA2NTcxOTMxNX0.D_FMIVZCf_qZLHkwZzXbt0qBRjVw93BWqNzSdhAGxeo'

const supabase = createClient(supabaseUrl, supabaseKey)

const createTables = async () => {
  console.log('Création des tables Supabase...')
  
  const sql = `
-- Table des projets
CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  description text,
  type text CHECK (type IN ('personnel', 'professionnel')) DEFAULT 'personnel',
  color text DEFAULT '#7c3aed',
  budget_total numeric(10,2) DEFAULT 0,
  budget_spent numeric(10,2) DEFAULT 0,
  status text CHECK (status IN ('actif', 'en_pause', 'terminé', 'archivé')) DEFAULT 'actif',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des tâches
CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('à_faire', 'en_cours', 'terminé', 'annulé')) DEFAULT 'à_faire',
  priority text CHECK (priority IN ('basse', 'normale', 'haute', 'urgente')) DEFAULT 'normale',
  due_at timestamptz,
  completed_at timestamptz,
  is_recurring boolean DEFAULT false,
  rrule text,
  recurring_parent_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  tags text[] DEFAULT '{}',
  estimated_minutes integer,
  actual_minutes integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies pour projects
CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Policies pour tasks
CREATE POLICY "Users can view their own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  `
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('Erreur lors de la création des tables:', error)
    } else {
      console.log('✅ Tables créées avec succès!')
    }
  } catch (err) {
    console.error('Erreur:', err)
  }
}

createTables()
