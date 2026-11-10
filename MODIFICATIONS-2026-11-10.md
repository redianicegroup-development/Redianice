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
