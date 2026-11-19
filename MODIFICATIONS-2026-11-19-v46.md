# V45 → V46 : le logo 3D se pose à la place de la marque du logo combiné du pied de page

## Changement
En fin de page, le GLB ne se range plus sous le logo du pied de page : il prend la place de la marque encadrée du logo combiné (`assets/logo-fonce.png`), juste à gauche du mot « redianice », qui reste. Le slogan remonte comme avant (plus d'emplacement réservé sous le logo).

## Fichiers
- `index.html` : l'image du logo du pied de page porte `data-l3d-end` ; l'élément `.foot__mark` est supprimé.
- `css/style.css` : sous `html.l3d`, les 19 % de gauche de l'image du logo sont masqués (`clip-path`), ce qui cache la marque encadrée (le carré fait les 145 premiers px de 900, le mot commence à 201 px). Sans WebGL, rien n'est masqué.
- `js/logo3d.js` : la position finale se calcule depuis cette image (centre du monogramme à 49,5 % de la hauteur de l'image, à partir de la gauche) ; la hauteur finale est `CFG.footMark` × la hauteur du logo (1 = la hauteur du carré de la marque). Pour un GLB plus petit ou plus grand à cet endroit, change `footMark` (0,75 = taille du monogramme seul).
