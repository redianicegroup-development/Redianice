# V46 → V47 : le logo 3D sur toutes les pages

## Changement
L'animation du logo 3D (arrière-plan qui tourne avec le défilement, puis arrivée à la place de la marque du logo du pied de page) fonctionne sur les 10 pages : accueil, 404, mentions légales, confidentialité, investir, les 4 fiches équipe, la fiche produit Mon E-Carnet et l'ancienne page portfolio/e-carnet.

- **Accueil** : inchangé (zigzag dans « À propos », puis fond, puis pied de page).
- **Autres pages** : le logo est en arrière-plan dès le haut de page (apparition en fondu au chargement), fait un tour sur lui-même tous les 3,7 écrans de défilement (au moins 1 tour par page), et se pose de face à la place de la marque du logo du pied de page quand on atteint le bas. L'arrivée se cale sur le bas de page atteignable, même quand le pied de page ne peut pas monter jusqu'en haut (pages courtes, mobile).

## Fichiers
- `js/logo3d.js` : fonctionne avec ou sans « À propos » (`home`) ; `CFG.turns` est remplacé par `CFG.vhPerTurn`.
- Toutes les pages sauf l'accueil : `<canvas class="l3d-canvas" id="l3d">` avant `<main>`, `data-l3d-end` sur l'image du logo du pied de page, `<script src="/js/logo3d.js" defer>`.
- `css/style.css` : sous `html.l3d`, les sections de `main` et le pied de page sont transparents (`main>.sec`) ; le rideau et le masquage du hero ne concernent que l'accueil.

## À savoir pour une future page
Reprendre ces trois éléments (canvas avant `<main>`, `data-l3d-end` sur l'image du logo du pied de page, script). Sans l'un d'eux, la page garde simplement son aspect d'avant.
