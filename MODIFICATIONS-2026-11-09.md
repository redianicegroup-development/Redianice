# Modifications du 09/11/2026 — V5 → V6

## Accueil
- **Hero fixe** (PC et mobile) : il reste en place, les sections passent par-dessus comme un rideau (`position: sticky`). Écran plus court que le hero : `main.js` recale `top` pour que tout le texte reste lisible. Le logo du menu suit le bord de la section qui recouvre le hero.
- Retirés : les 3 captures du hero (+ leur CSS et l'animation GSAP associée), les 4 pastilles de valeurs (Simplicité, Utilité, Transparence, Exigence).
- **Effet de lumière sur « Redianice conçoit, teste et lance… »** : il existait déjà, mais se déclenchait trop tôt (le texte arrivait déjà allumé). Cause : les ScrollTrigger des textes situés sous la section épinglée « Nos produits » étaient calculés avant l'épinglage. Correctif : `refreshPriority: 1` sur l'épinglage (`js/main.js`). Les textes d'Investir et de Contact bénéficient aussi du correctif.
- « Où nous en sommes », « Prochains jalons » et « Ce que ce soutien finance » sont **déplacés sur la page E-Carnet** (la page /investir/ garde les siens).
- Pastille « Nos produits sont ici » : passe sous le texte (elle se collait à la fin de la phrase).

## Page E-Carnet (`/produits/e-carnet/`)
Nouvelle structure : logo → HealthTech / Carnet de santé numérique (Côte d'Ivoire) → Mon E-Carnet → Context, Goals, Services & Expertises, The Insight, The Process, The Result → Aperçu de l'application (captures) → Comment ça marche (SVG animé) → Où nous en sommes, Prochains jalons, Ce que ce soutien finance → Limites connues → boutons.
- Tous les sous-titres utilisent le style de « Notre vision » (`.uses__h`).
- **SVG animé** « Comment ça marche » : scène unique (téléphones patient et professionnel) en boucle de 20 s, liste des 5 étapes synchronisée. L'animation ne tourne que lorsqu'elle est visible, avec bouton pause ; « réduire les animations » = image fixe. Généré par un script de travail (non livré dans le site, disponible sur demande).
- Retirés de la page : Le problème, La réponse, Les fonctionnalités, Confidentialité et sécurité, À qui s'adresse-t-il, Ce qui le distingue, Le modèle économique, État du produit et feuille de route, FAQ. **Conservé** : « Limites connues » (carte d'urgence copiée 24 h sans chiffrement applicatif, 2FA absente, validations en attente).
- JSON-LD : le bloc FAQPage est retiré (la FAQ n'est plus affichée sur cette page).
- Liste « Où nous en sommes » : la ligne « Premier produit, Mon E-Carnet, … » ne se coupe plus en 3 colonnes.

## Pied de page (toutes les pages)
Liens de navigation retirés, sauf Mentions légales et Confidentialité. Nouveau pied : logo, phrase d'accroche, adresse, contact (e-mail, WhatsApp, LinkedIn), liens légaux, retour en haut de page.

## Divers
- `llms.txt` / `llms-full.txt` : valeurs retirées, description de la page E-Carnet mise à jour.

## À savoir
- Les photos d'équipe (`assets/team/*.jpg`) manquent encore : 4 erreurs 404 au chargement (déjà le cas en V5).
- Le fichier `.env` était dans le zip V5 : ne jamais le partager ; il n'est pas dans cette livraison.
