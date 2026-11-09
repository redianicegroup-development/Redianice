# Redianice

Site vitrine de Redianice, startup indépendante qui conçoit et lance ses propres produits numériques. Le site présente l’entreprise et son premier produit, **Mon E-Carnet**.

## Aperçu

- Site responsive en HTML, CSS et JavaScript, sans étape de compilation.
- Animations et défilement enrichis avec GSAP, ScrollTrigger et Lenis.
- Formulaire de contact traité par une fonction serverless dans `api/contact.js`, avec envoi via Resend.
- Page dédiée à Mon E-Carnet dans `portfolio/e-carnet/`.

## Structure

| Chemin | Contenu |
| --- | --- |
| `index.html` | Page d’accueil et formulaire de contact |
| `portfolio/e-carnet/` | Présentation de Mon E-Carnet |
| `css/style.css` | Styles du site |
| `js/main.js` | Interactions et formulaire |
| `js/vendor/` | Bibliothèques JavaScript utilisées |
| `api/contact.js` | API serverless du formulaire |
| `assets/` | Images, logos et polices |

## Développement local

Le site ne nécessite ni compilation ni installation de dépendances pour ses pages statiques. Pour tester également le formulaire, utilisez l’environnement local de Vercel afin d’exécuter la fonction API :

1. Installez la CLI Vercel et connectez-vous avec `vercel login`.
2. À la racine du projet, copiez `.env.example` vers `.env` et renseignez les variables ci-dessous.
3. Lancez `vercel dev` depuis la racine du projet.

Sans l’environnement Vercel, les pages peuvent être ouvertes avec un serveur statique, mais l’envoi du formulaire ne fonctionnera pas.

## Variables d’environnement

| Variable | Rôle |
| --- | --- |
| `RESEND_API_KEY` | Clé API Resend utilisée uniquement par le serveur |
| `RESEND_FROM` | Adresse expéditrice vérifiée dans Resend, au format `Nom <adresse@domaine.com>` |
| `CONTACT_TO` | Adresse destinataire des messages du formulaire |

`.env.example` fournit un modèle. Le fichier `.env` est ignoré par Git : ne le committez et ne le partagez jamais. Pour le déploiement, ajoutez les trois variables dans les paramètres d’environnement du projet Vercel. Ne placez aucune clé secrète dans le code JavaScript côté navigateur.

## Déploiement

Importez le dépôt dans Vercel et déployez-le depuis la branche `main`. Vercel sert les fichiers statiques et déploie automatiquement `api/contact.js` comme fonction serverless. Configurez les variables d’environnement dans Vercel avant de tester le formulaire. L’expéditeur `RESEND_FROM` doit utiliser un domaine vérifié auprès de Resend.
