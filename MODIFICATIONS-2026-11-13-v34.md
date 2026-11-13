# V33 → V34 : nouveau logo (WebP) et carte E-Carnet en visuel avec détails au survol / toucher

## Logo
- Nouveau fichier `assets/logo-redianice.webp` (1024 × 1024, fond transparent), tiré de `LOGO_RE.pdf`.
- Remplace l'ancien logo dans l'en-tête (toutes les pages) et dans la section « À propos » de l'accueil.
- Les anciens fichiers (`mark-fonce.png`, `mark-vector.svg`) ne sont plus utilisés ; l'icône d'onglet (`mark.png`) et `logo-fonce.png` (pied de page) n'ont pas changé.

## Carte « Mon E-Carnet » (section Nos produits)
- La carte affiche le visuel `assets/e-carnet-visuel.webp` en plein cadre, avec une petite pastille « + Détails ».
- Souris : au survol, un panneau passe par-dessus avec le logo, le nom, le statut, la description, le bouton et la note.
- Téléphone / tablette : un toucher ouvre les détails, un second toucher (ou un toucher ailleurs) les referme. Clavier : le focus les ouvre, Échap les ferme.
- Pour mettre un vrai GIF animé : déposer `assets/e-carnet-visuel.gif` et changer l'extension dans `index.html` (une seule ligne, dans `.pcard__media`).

## Fichiers touchés
`index.html`, `css/style.css` (bloc V34 en fin de fichier), `js/main.js` (bloc « Produits »), les 10 autres pages (logo de l'en-tête uniquement), `assets/` (2 nouveaux fichiers).

## Bleu du site = bleu du logo
- Le bleu du site (`--blue`, titres, boutons, traits, icônes) passe de `#0b3dff` à `#3d5a8d`, le bleu exact du logo. Remplacé dans `css/style.css`, `js/footer-fx.js`, `api/contact.js` (e-mail) et `produits/e-carnet/index.html`.
- Pour le changer plus tard : `--blue` en haut de `css/style.css` (et ses variantes `rgba(61,90,141,…)`).
- Non touchés : le dégradé clair du fond de l'accueil (`js/hero-bg.js`) et l'icône d'onglet `assets/mark.png`, à refaire avec le nouveau logo si besoin.
