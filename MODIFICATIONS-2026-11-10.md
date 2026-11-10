# Modifications du 10/11/2026 — V8 → V9 (équipe, fiches, pages produit)

Base : redianice-site_V8-equipe.zip (textes de la V8 conservés tels quels).

## Équipe (accueil)
- **Révélation d'image** : au survol (souris) ou au toucher (mobile), le portrait apparaît en cercle qui grandit depuis le point survolé/touché ; le rôle, le nom et la description s'effacent ; un bouton « Voir la fiche » apparaît.
- **Clic** : souris = un clic ouvre la fiche. Mobile = 1er toucher révèle, 2e toucher ouvre la fiche (un toucher ailleurs referme). Clavier : le focus révèle la carte.
- **Photos** : dépose `elvis.jpg`, `chef-projet.jpg`, `graphiste-1.jpg`, `graphiste-2.jpg` dans `assets/team/` (voir LISEZ-MOI.txt) : aucun code à toucher. Tant qu'un fichier manque, le portrait neutre s'affiche (4 erreurs 404 dans la console, sans conséquence).

## Fiches équipe (`/equipe/<nom>/`) — refaites
Même habillage que le site (menu, bandeau, pied de page). Portrait qui se dévoile, rôle, « Son rôle chez Redianice », parcours (frise), contact (écrire, copier l'adresse, WhatsApp), liens, puis « Découvrir les autres membres » (cartes à révélation d'image). Les contenus absents (nom, parcours, liens des 3 autres membres) affichent un encart « à venir » ; ces 3 fiches sont en `noindex` tant qu'elles ne sont pas complétées. Le contact affiché est celui de Redianice.

## Page Mon E-Carnet
- **Sommaire collant** (puces défilantes, section en cours surlignée, clic = défilement doux) et **barre de progression** de lecture.
- **Captures** : flèches + compteur « 1 / 7 », agrandissement plein écran (flèches, glisser, Échap, légende).
- **Apparition douce** des blocs au défilement (désactivée si « réduire les animations »).
- Bloc « Rencontrer l'équipe de Redianice » en bas (cartes à révélation d'image).

## Correctifs
- Le logo du menu était invisible sur les bandeaux bleu ciel des sous-pages (blanc sur bleu clair) : version foncée tant que le bandeau est derrière l'en-tête.
- Pied de page des sous-pages : même phrase d'accroche que l'accueil.
- `sitemap.xml` : fiche de M'Bollo Aka Elvis ajoutée.

## Fichiers
index.html, css/style.css, js/main.js, produits/e-carnet/, equipe/*/, investir/, mentions-legales/, confidentialite/, 404.html, portfolio/e-carnet/, sitemap.xml, assets/team/LISEZ-MOI.txt.

## Mise à jour : photos et contenu des fiches
- **Photos ajoutées** : `assets/team/elvis.jpg` (M'Bollo Aka Elvis) et `assets/team/graphiste-2.jpg` (graphiste freelance), recadrées en 4:5. Restent à ajouter : `chef-projet.jpg` et `graphiste-1.jpg`.
- **Fiche de M'Bollo Aka Elvis** : parcours (études en réseau et sécurité informatique, 2022 premier projet freelance, 2023 premières applications métier, 2024 AKATech devient une agence, aujourd'hui développeur freelance à AKATech Studio et cofondateur de Redianice, plus de 10 clients et PME), réalisations choisies, contact et liens d'AKATech Studio (e-mail, WhatsApp, LinkedIn, GitHub, portfolio), carte du studio avec l'affiche AKATech (`assets/akatech-studio.webp`). Informations reprises du site AKATech (historique, projets, contact) et du profil GitHub.
- **Fiche du graphiste (2e)** : freelance, chartes graphiques et branding ; texte « Ce qu'il fait » rédigé sans fait inventé ; nom, parcours et liens à venir (fiche en `noindex` tant que le nom manque). Texte passé au masculin.
- README : lignes `equipe/` et `assets/team/` ajoutées.

## V10 → V11 : retours sur les captures

### Fiches équipe
- **« Réalisations choisies »** retirée (fiche de M'Bollo Aka Elvis).
- **« Contact » et « Liens » fusionnés** en une seule section « Contact et liens » : une rangée d'icônes, sans adresse ni numéro écrits, et plus de bouton « Copier l'adresse ». Elvis : e-mail, WhatsApp, LinkedIn, GitHub, portfolio (e-mail et WhatsApp d'AKATech Studio). Les trois autres fiches : e-mail, WhatsApp et LinkedIn de Redianice.
- **Facebook** : le site ne contient aucune adresse de page Facebook. L'icône est prête, en commentaire (`<!-- Facebook … -->`) dans la rangée d'icônes de chaque fiche : remplacer `URL_FACEBOOK` et retirer les balises de commentaire.
- **Carte AKATech Studio** : l'affiche est remplacée par le logo (`assets/akatech-logo.webp`, fond transparent). `assets/akatech-studio.webp` n'est plus utilisée et a été retirée.

### Page Mon E-Carnet
- **Sommaire** (Le problème, Objectifs, Conception…) : il ne suit plus le défilement. Il reste en haut de l'article, avec tous les repères visibles (retour à la ligne, plus de défilement horizontal). Un clic défile toujours doucement jusqu'à la section.

### Cartes équipe (accueil, Mon E-Carnet, bas des fiches)
- **Portrait toujours visible**, en plein cadre ; le rôle est une petite pastille discrète en haut à gauche.
- **Survol (souris) ou toucher (mobile)** : un dégradé léger monte depuis le bas et le nom, l'intitulé et la description s'affichent en bas de la carte, avec un bouton **« En savoir plus »** discret.
- Souris : le clic ouvre la fiche. Mobile : 1er toucher = infos, 2e toucher ou bouton = fiche (un toucher ailleurs referme).

### Fichiers modifiés
index.html, css/style.css, js/main.js, produits/e-carnet/index.html, equipe/*/index.html, assets/akatech-logo.webp (nouveau), assets/akatech-studio.webp (retiré).
