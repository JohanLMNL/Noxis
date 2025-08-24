-- JMNL Productivity - Données de démarrage
-- Créer le compte utilisateur principal

-- Insérer l'utilisateur principal
-- Note: Remplacez 'votre-email@example.com' et 'votre-mot-de-passe' par vos vraies valeurs
-- Le mot de passe sera hashé automatiquement par Supabase Auth

-- Cette insertion doit être faite via le dashboard Supabase ou via l'API Auth
-- Voici un exemple de script pour créer l'utilisateur via SQL (à adapter) :

/*
-- Option 1: Via le dashboard Supabase Auth
-- Allez dans Authentication > Users > Add user
-- Email: j.lemesnil@gmail.com
-- Password: votre_mot_de_passe_sécurisé
-- Confirm password: votre_mot_de_passe_sécurisé

-- Option 2: Via l'API Supabase (recommandé)
-- Utilisez le client Supabase pour créer l'utilisateur :
*/

-- Données d'exemple une fois l'utilisateur créé
-- (Ces données seront insérées automatiquement avec le bon user_id)

-- Projet d'exemple
INSERT INTO projects (name, description, type, color, budget_total) 
VALUES 
  ('Projet Personnel', 'Projets personnels et tâches quotidiennes', 'personnel', '#7c3aed', 0),
  ('Travail', 'Projets professionnels', 'professionnel', '#059669', 5000)
ON CONFLICT DO NOTHING;

-- Tâches d'exemple
INSERT INTO tasks (title, description, status, priority, due_at, project_id) 
SELECT 
  'Configurer l''application',
  'Première configuration de JMNL Productivity',
  'terminé',
  'haute',
  now() + interval '1 day',
  p.id
FROM projects p 
WHERE p.name = 'Projet Personnel'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, status, priority, due_at, tags) 
VALUES 
  ('Tâche récurrente test', 'Test des tâches récurrentes', 'à_faire', 'normale', now() + interval '1 day', ARRAY['test', 'récurrent'])
ON CONFLICT DO NOTHING;
