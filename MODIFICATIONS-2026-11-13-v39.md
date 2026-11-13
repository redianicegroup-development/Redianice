# V38 → V39 : bouton Menu bleu, photos de section, GIF E-Carnet, pages légales, colonne Contact fixe

## Bouton « Menu » (`css/style.css`, `js/main.js`)
- Fond bleu du logo (`--blue`, #3d5a8d), texte clair. Le texte n'était plus coupé : la glissière « Menu / Fermer » était dans une grille (`display:grid`) qui décalait les deux états ; elle est maintenant positionnée en absolu et chaque état occupe exactement la hauteur du bouton.
- Masqué tant que le hero de l'accueil occupe l'écran (classe `body.in-hero`). Il apparaît dès que la section « À propos » recouvre plus de la moitié de l'écran. Réglage : `HERO_MENU_AT` dans `js/main.js` (0.5 = moitié de l'écran). Les autres pages gardent le bouton.

## Photos (`index.html`, `assets/photos/`)
- « Grandir à plusieurs » : photo « Bâtir ensemble » entre le texte et les deux cartes (`partenariat-16x9.webp` / `partenariat-9x16.webp`).
- Entre « Notre méthode » et « Notre approche » : nouvelle section photo (`idees-utiles-16x9.webp` ordinateur et tablette, `projets-concrets-9x16.webp` téléphone).
- `<picture>` : 9:16 en dessous de 760 px, 16:9 au-dessus. Images recompressées (2048 px de large, 1080 px pour le 9:16 ; 170 à 230 Ko chacune). Cadre : trait bleu et angles arrondis (`.photo`).

## Mon E-Carnet (`index.html`, `assets/e-carnet-presentation.gif`)
- La carte « Notre premier produit » affiche le GIF animé à la place de `e-carnet-visuel.webp` (le fichier reste dans `assets/`, plus utilisé). Même cadrage (540×608). Poids du GIF : 6,8 Mo.

## Pages légales (`mentions-legales/`, `confidentialite/`, `css/style.css`)
- Classe `doc--legal` : contenu centré (colonne de 48 rem), marges latérales d'au moins 24 px, haut qui dégage le logo (le titre ne passe plus dessous), bas qui dégage le bouton Menu.

## Contact (`index.html`, `css/style.css`, `js/main.js`)
- À partir de 760 px, la colonne de gauche (titre + texte) reste fixe, centrée dans l'écran, tant que le formulaire défile à côté (`.contact__side` / `.contact__sticky`, `position: sticky`). `--cs-top` est calculé dans `js/main.js`. Téléphone : colonne simple, rien de fixe.

## Fichiers
Modifiés : `index.html`, `mentions-legales/index.html`, `confidentialite/index.html`, `css/style.css` (bloc V39 en fin de fichier + règles `.mbtn`), `js/main.js`, `README.md`.
Ajoutés : `assets/photos/*.webp` (4), `assets/e-carnet-presentation.gif`.
