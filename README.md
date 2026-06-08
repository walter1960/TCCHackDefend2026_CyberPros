# TCCHackDefend2026 CyberPros

## Présentation du projet

Ce dépôt contient le code source de la solution développée par l'équipe CyberPros dans le cadre du TCCHackDefend 2026. 
Il s'agit d'une plateforme intelligente de gestion des ressources humaines, spécialisée dans le recrutement automatisé et l'analyse sémantique de curriculum vitae (CV). Le système se connecte directement aux messageries d'entreprise, extrait les pièces jointes, et évalue leur pertinence par rapport aux critères de postes spécifiques grâce à l'Intelligence Artificielle.

## Fonctionnalités principales

- **Analyse native de documents PDF** : Traitement direct des CV sans extraction de texte intermédiaire, garantissant une meilleure compréhension du contexte et de la mise en page.
- **Intégration transparente aux messageries** : Connexion sécurisée via le protocole OAuth2 aux API Google Workspace (Gmail) et Microsoft Graph (Outlook).
- **Filtrage et classement automatiques** : Évaluation des candidatures par l'IA (Gemini) selon les critères spécifiques définis par les recruteurs.
- **Gestion des doublons** : Système anti-doublon intelligent conservant uniquement la version la plus pertinente ou la mieux notée d'un CV envoyé à plusieurs reprises.
- **Tableau de bord de suivi** : Interface de gestion claire permettant la consultation rapide des profils retenus, en attente ou rejetés.

## Architecture technique

Le projet repose sur des technologies modernes, assurant performance et scalabilité :

- **Front-end / Back-end** : Next.js (App Router), React, TypeScript.
- **Intelligence Artificielle** : API Google Gemini (modèle gemini-1.5-flash) pour le traitement rapide et l'inférence sur documents.
- **Base de données** : PostgreSQL gérée via l'ORM Prisma.
- **Authentification** : NextAuth.js pour la gestion des sessions sécurisées et des flux OAuth2.
- **Style et interface** : Tailwind CSS pour une conception réactive et modulaire.

## Prérequis

Avant de lancer le projet en local, assurez-vous de disposer des éléments suivants :

- Node.js (version 18 ou supérieure)
- Une instance PostgreSQL fonctionnelle
- Un compte Google Cloud Console avec l'API Gmail activée et des identifiants OAuth2
- (Optionnel) Un compte Microsoft Azure pour l'intégration Outlook
- Une clé d'API Google Gemini

## Installation et configuration

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/walter1960/TCCHackDefend2026_CyberPros.git
   cd TCCHackDefend2026_CyberPros
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Configuration de l'environnement :
   Créer un fichier `.env` à la racine du projet et configurer les variables suivantes :
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="votre_secret_genere"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="votre_client_id_google"
   GOOGLE_CLIENT_SECRET="votre_client_secret_google"
   
   # Intelligence Artificielle
   GEMINI_API_KEY="votre_cle_api_gemini"
   ```

4. Initialiser la base de données :
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

L'application sera accessible sur http://localhost:3000.

## Déploiement

Le projet est optimisé pour un déploiement sur la plateforme Vercel. 
Note : En raison du temps de traitement requis par l'API Gemini pour la lecture de multiples documents PDF, la durée maximale d'exécution (maxDuration) des fonctions Serverless a été configurée à 60 secondes pour éviter les interruptions d'infrastructure.

## Licence et Confidentialité

Ce projet est développé dans le cadre strict de la compétition TCCHackDefend 2026. Toute reproduction ou réutilisation des algorithmes d'analyse doit respecter les politiques de confidentialité en vigueur.
