# Aurevia — Guide de déploiement

Ce dossier est le code de la plateforme Aurevia (React + Vite), exporté depuis Figma Make.
**Aucune logique ni aucun design n'a été modifié.** Seuls des fichiers de configuration ont
été ajoutés ou corrigés pour permettre un déploiement réel.

## Ce qui a été préparé dans ce dossier

- ✅ Le projet a été testé : `npm install` et `npm run build` fonctionnent tous les deux sans erreur.
- ✅ Correction d'un conflit de dépendances : `react-leaflet` a été retiré du `package.json`
  car ce paquet n'était importé nulle part dans le code (seul `leaflet` brut est utilisé
  dans `MapView.tsx`) et il entrait en conflit avec React 18.
- ✅ Ajout de `.env.example` (déjà référencé dans `AUREVIA_SETUP.md` mais absent du dossier).
- ✅ Ajout de `.gitignore` standard (pour ne jamais publier tes clés API par erreur).
- ✅ Ajout de `vercel.json` pour un déploiement en un clic sur Vercel.
- ✅ Ajout du script `preview` pour tester le build en local avant déploiement.

## Ce qui reste à faire (le vrai travail de fond)

Le front-end (interface, navigation, écrans) est fonctionnel. Il manque encore deux briques
essentielles pour que ce soit une vraie plateforme transactionnelle :

1. **Google Maps API** — le code est déjà prêt (`src/app/hooks/useGoogleMaps.ts`), il tourne
   en mode démo. Suivre `AUREVIA_SETUP.md` et `GOOGLE_MAPS_INTEGRATION.md` (déjà présents
   dans ce dossier) pour obtenir et brancher une vraie clé API Google Maps/Places.

2. **Paiement réel (Stripe)** — `CheckoutScreen.tsx` affiche actuellement un écran de paiement
   simulé (aucune vraie transaction). Il faut :
   - Créer un compte Stripe.
   - Construire un petit backend (ex: via Supabase Edge Functions, ou un serveur Node séparé)
     qui crée les sessions de paiement, gère l'abonnement récurrent (29,99$/mois), le calcul
     de la commission de 10 % par service réservé, et les crédits urgence (50$/crédit utilisé).
   - Connecter `CheckoutScreen.tsx` à ce backend au lieu de la simulation actuelle.

3. **Base de données** — pour stocker les comptes courtiers, les prestataires, les réservations,
   et l'historique de facturation. Recommandé : Supabase (Postgres + authentification incluse,
   gratuit pour démarrer).

## Comment déployer une fois prêt

### Étape 1 — Tester en local
```bash
npm install
npm run dev
```

### Étape 2 — Mettre le code sur GitHub
Crée un dépôt GitHub et pousse ce dossier dedans (via l'interface GitHub Desktop si tu ne
veux pas utiliser la ligne de commande).

### Étape 3 — Déployer sur Vercel
1. Va sur [vercel.com](https://vercel.com), connecte ton compte GitHub.
2. Importe le dépôt — Vercel détecte automatiquement Vite grâce à `vercel.json`.
3. Ajoute tes variables d'environnement (`VITE_GOOGLE_MAPS_API_KEY`, etc.) dans les
   paramètres du projet Vercel (Settings → Environment Variables).
4. Clique sur Deploy. Ton site est en ligne avec une URL `*.vercel.app`.

### Étape 4 — Nom de domaine personnalisé
Dans Vercel → Settings → Domains, ajoute ton propre domaine (ex: aurevia.com) une fois acheté.

## Instruction à donner à une IA de développement (ex: Claude Code)

Tu peux copier-coller ceci tel quel :

> Voici mon application Aurevia (React + Vite). Ne change aucune logique ni aucun design
> existant. Aide-moi à : 1) brancher une vraie clé API Google Maps dans le mode déjà prévu
> par `useGoogleMaps.ts`, 2) construire un vrai système de paiement Stripe pour remplacer la
> simulation dans `CheckoutScreen.tsx` (abonnement mensuel 29,99$, commission 10% par
> réservation, crédits urgence à 50$), 3) ajouter une base de données Supabase pour les
> comptes, prestataires et réservations, 4) déployer le tout sur Vercel avec un lien
> fonctionnel.
