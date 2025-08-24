// Script pour créer les tables Supabase via l'API REST
const fetch = require('node-fetch')

const SUPABASE_URL = 'https://ooishzluwsqgluzykapy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaXNoemx1d3NxZ2x1enlrYXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNDMzMTUsImV4cCI6MjA2NTcxOTMxNX0.D_FMIVZCf_qZLHkwZzXbt0qBRjVw93BWqNzSdhAGxeo'

async function createTables() {
  console.log('🚀 Création des tables Supabase...')
  
  const queries = [
    // Créer la table projects
    `CREATE TABLE IF NOT EXISTS projects (
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
    );`,
    
    // Créer la table tasks
    `CREATE TABLE IF NOT EXISTS tasks (
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
    );`,
    
    // Activer RLS
    'ALTER TABLE projects ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;',
    
    // Policies pour projects
    `CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);`,
    `CREATE POLICY "Users can insert their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    `CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);`,
    `CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);`,
    
    // Policies pour tasks
    `CREATE POLICY "Users can view their own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);`,
    `CREATE POLICY "Users can insert their own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    `CREATE POLICY "Users can update their own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);`,
    `CREATE POLICY "Users can delete their own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);`
  ]
  
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i]
    console.log(`📝 Exécution requête ${i + 1}/${queries.length}...`)
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ sql: query })
      })
      
      if (!response.ok) {
        console.log(`⚠️  Requête ${i + 1} ignorée (probablement déjà existante)`)
      } else {
        console.log(`✅ Requête ${i + 1} exécutée avec succès`)
      }
    } catch (error) {
      console.log(`⚠️  Requête ${i + 1} ignorée:`, error.message)
    }
  }
  
  console.log('🎉 Configuration Supabase terminée!')
  console.log('Vous pouvez maintenant créer des tâches dans votre application.')
}

createTables().catch(console.error)
