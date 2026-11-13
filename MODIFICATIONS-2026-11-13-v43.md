# V42 → V43 : logo sans contour, logo du pied de page, dégradés au défilement, message E-Carnet

## Logo (`assets/logo-redianice.webp`)
- Le contour carré autour de la marque est retiré (en-tête, menu, section À propos, toutes les pages). La marque reste exactement à la même place et à la même taille. Favicon et images de partage (`mark*.png`, `og-*.png`) inchangés.

## Loader (`assets/logo-loader.gif`)
- Le contour carré est retiré des 37 images de l'animation (la marque se dessine puis se remplit, comme avant). Même format 1024 × 1024, mêmes durées, même boucle, même position de la marque ; poids ~223 Ko (408 Ko avant). L'archive reçue ne contenait pas ce fichier : il est ajouté.

## Pied de page (`assets/logo-fonce.png`)
- Le logo combiné (marque + « redianice ») passe du bleu vif #0b3dff au bleu de la marque de l'en-tête, #3d5a8d (`--blue`). Le fichier est utilisé uniquement dans les pieds de page.

## Dégradés des cartes en grille (`js/main.js`, `css/style.css`)
- Ils ne s'allument plus au survol, au toucher ni au focus : `--hg` (0 à 1) est calculé au défilement selon la position de la carte (pleine intensité vers le milieu de l'écran, éteint vers les bords). Concerne `.pcard`, `.pcard--soon`, `.flow li`, `.deal`, `.steps li`, `.tp-work li`.
- Réglage dans `js/main.js` : `span = vh * 0.45` (distance du milieu où la carte est éteinte) et `/ 0.6` (largeur de la zone pleinement allumée).
- Le suivi du pointeur (`--gx` / `--gy`) est supprimé ; le bord bleu au survol (`border-color`) est conservé.

## Mon E-Carnet (`index.html`)
- Sous « Voir le produit » : « Projet indisponible ».
