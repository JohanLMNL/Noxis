# Noxis

Une PWA (Progressive Web App) de productivité personnelle construite avec Next.js 14, Supabase et shadcn/ui. Application en français avec thème dark et accents violets.

## 🚀 Fonctionnalités

- **Authentification sécurisée** : Connexion par email/mot de passe (Supabase Auth)
- **Gestion des tâches** : Création, modification, suppression avec priorités et tags
- **Tâches récurrentes** : Support RRULE avec saisie en français naturel
- **Projets** : Organisation par projets personnels/professionnels avec budgets
- **Suivi du temps** : Enregistrement manuel des heures de travail
- **PWA complète** : Installation, notifications, fonctionnement hors ligne
- **Interface moderne** : Dark mode, accents violets avec effets de glow

## 🛠 Stack Technique

- **Frontend** : Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI** : shadcn/ui avec composants Radix UI
- **Backend** : Supabase (PostgreSQL + Auth + RLS)
- **PWA** : Service Worker, Web App Manifest, Notifications
- **Dates** : date-fns avec locale française
- **Récurrences** : rrule.js pour les tâches répétitives

## 📋 Prérequis

- Node.js 18+ 
- Compte Supabase
- Projet Supabase nommé "productivity"

## 🔧 Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd Noxis
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

#### Variables d'environnement

Créez un fichier `.env.local` :

```bash
cp .env.local.example .env.local
```

Remplissez avec vos informations Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anonyme
```

#### Base de données

1. **Créer les tables** :
   ```sql
   -- Dans l'éditeur SQL Supabase, exécutez :
   -- Contenu du fichier supabase.sql
   ```

2. **Activer RLS et créer les policies** :
   ```sql
   -- Dans l'éditeur SQL Supabase, exécutez :
   -- Contenu du fichier policies.sql
   ```

3. **Créer le compte utilisateur** :
   - Allez dans Authentication > Users
   - Cliquez sur "Add user"
   - Email : votre@email.com
   - Password : votre_mot_de_passe_sécurisé
   - Confirmez le mot de passe

4. **Données d'exemple** (optionnel) :
   ```sql
   -- Exécutez le contenu de seed.sql après avoir créé l'utilisateur
   ```

### 4. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📱 Fonctionnalités PWA

### Installation

- **Desktop** : Clic sur l'icône d'installation dans la barre d'adresse
- **Mobile** : Popup d'installation automatique après quelques secondes
- **Manuel** : Menu navigateur > "Installer l'application"

### Notifications

1. Accepter les permissions de notification
2. Les rappels s'affichent pour les tâches importantes
3. Fonctionne même quand l'app est fermée

### Mode hors ligne

- Cache automatique des pages principales
- Synchronisation des données au retour en ligne
- Interface accessible sans connexion

## 🎯 Utilisation

### Connexion

1. Allez sur `/auth/sign-in`
2. Utilisez l'email/mot de passe créé dans Supabase
3. Redirection automatique vers `/today`

### Tâches

- **Création rapide** : Barre de saisie sur la page "Aujourd'hui"
- **Récurrences** : "tous les lundis", "chaque mois", "quotidien", etc.
- **Priorités** : Basse, Normale, Haute, Urgente (avec couleurs)
- **Tags** : Organisation libre par mots-clés

### Projets

- **Types** : Personnel ou Professionnel
- **Budget** : Suivi des dépenses avec progression visuelle
- **Temps** : Enregistrement manuel des heures
- **Ressources** : Liens, notes, contacts
- **Journal** : Historique du projet

## 🔒 Sécurité

- **RLS activé** : Chaque utilisateur ne voit que ses données
- **Authentification** : Gestion sécurisée par Supabase Auth
- **Middleware** : Protection automatique des routes
- **Policies** : Contrôle d'accès au niveau base de données

## 🚀 Déploiement

### Vercel (recommandé)

1. Connectez votre repo GitHub à Vercel
2. Ajoutez les variables d'environnement
3. Déployez automatiquement

### Autres plateformes

Compatible avec toute plateforme supportant Next.js :
- Netlify
- Railway
- DigitalOcean App Platform

## 📂 Structure du projet

```
Noxis/
├── app/                    # Pages Next.js (App Router)
│   ├── (dashboard)/       # Pages protégées
│   │   ├── today/         # Page "Aujourd'hui"
│   │   ├── tasks/         # Gestion des tâches
│   │   └── projects/      # Gestion des projets
│   ├── auth/              # Authentification
│   ├── globals.css        # Styles globaux
│   └── layout.tsx         # Layout principal
├── components/            # Composants React
│   ├── ui/               # Composants shadcn/ui
│   ├── TaskCard.tsx      # Carte de tâche
│   ├── ProjectCard.tsx   # Carte de projet
│   └── ...
├── lib/                  # Utilitaires
│   ├── supabase/         # Configuration Supabase
│   ├── rrule/            # Gestion des récurrences
│   ├── dates.ts          # Utilitaires de dates
│   └── types.ts          # Types TypeScript
├── public/               # Fichiers statiques
│   ├── icons/            # Icônes PWA
│   ├── sw.js            # Service Worker
│   └── manifest.json    # Manifest PWA
├── supabase.sql         # Schema de base de données
├── policies.sql         # Politiques RLS
└── seed.sql            # Données d'exemple
```

## 🐛 Dépannage

### Erreurs courantes

**"Unauthorized"** : Vérifiez que l'utilisateur est créé dans Supabase Auth

**Pas de données** : Vérifiez que les policies RLS sont correctement configurées

**PWA ne s'installe pas** : Vérifiez que l'app est servie en HTTPS

### Logs

- **Service Worker** : Console navigateur > Application > Service Workers
- **Supabase** : Dashboard Supabase > Logs
- **Next.js** : Terminal de développement

## 📄 Licence

Projet personnel - Tous droits réservés

## 🤝 Contribution

Projet personnel, pas de contributions externes acceptées pour le moment.

## 📞 Support

Pour toute question ou problème, créez une issue dans le repository.
