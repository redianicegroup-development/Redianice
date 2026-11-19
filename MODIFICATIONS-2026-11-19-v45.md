# V44 → V45 : logo 3D (GLB) dans « À propos », en fond de page, puis sous le logo du pied de page

## Fichiers
- `assets/redianice_official_no_frame.glb` : le modèle fourni (monogramme + empreinte, couleur #275BAE).
- `js/logo3d.js` (nouveau) : chargeur GLB et rendu WebGL maison, sans three.js. Un seul canvas fixe `#l3d` (ajouté dans `index.html`, avant « À propos »).
- `index.html` : canvas `#l3d`, attribut `data-l3d-slot` sur `.about__logo`, emplacement `.foot__mark` (`data-l3d-end`) sous le logo du pied de page, script `js/logo3d.js`.
- `js/main.js` : le zigzag de « À propos » déplace toujours l'emplacement du logo, mais la rotation 2D devient une rotation 3D (un tour par trajet, `window.__l3d.spin`). Téléphone : la marque pivote doucement de -35° à 35°.
- `css/style.css` : bloc V45 en fin de fichier.

## Comportement (accueil uniquement)
1. **« À propos »** : le GLB remplace le logo en zigzag (même trajet, même emplacement, il fait un tour sur lui-même à chaque changement de côté).
2. **Après « À propos »** : il passe au centre de l'écran, en grand (80 % de la hauteur), en arrière-plan de toute la page, et tourne sur lui-même avec le défilement (3 tours jusqu'au pied de page).
3. **Fin de page** : il glisse sous le logo du pied de page, se range de face, opacité pleine. Le slogan descend d'autant.

## Couches (pour que le logo soit visible derrière le texte)
- Les sections après le hero et le pied de page sont transparentes (le fond blanc cassé vient de la page). « À propos » garde son rideau opaque (`#apropos::before`) pour recouvrir le hero.
- Le hero, resté fixe derrière, est masqué (`html.l3d-past-hero`) dès que « À propos » atteint le haut de l'écran, quand il est entièrement recouvert.
- Tout est conditionné à `html.l3d`, ajoutée par le script une fois le modèle chargé. Sans WebGL ou si le fichier manque : aucun changement, le logo image reste affiché. Mouvement réduit : pas de rotation.

## Réglages (`CFG` en tête de `js/logo3d.js`)
`turns` (tours), `bgOpacity` (opacité du fond, 0,45), `bgHeight` (taille du fond), `tilt` (inclinaison), `aboutOut` / `footIn` (moments des deux passages). Taille de l'emplacement final : `.foot__mark` dans `css/style.css`.

## Limite
Le chargeur lit les maillages triangulés, une matière et une texture intégrée, sans transformations de nœuds (c'est le cas du fichier fourni). Un autre GLB avec des nœuds déplacés ou pivotés demanderait d'ajouter ces transformations.
