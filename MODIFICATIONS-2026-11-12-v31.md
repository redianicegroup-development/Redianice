# V30 → V31 : pied de page plein écran + disposition des objets de la capture

## Pied de page (11 pages, ordinateur et téléphone)
- **Le pied de page occupe exactement un écran** (`min-height: 100svh`, repli `100vh`) : logo, slogan, icônes, mot « redianice » avec ses objets, barre du bas. Avant : 1166 px de haut sur un écran de 738 px (ordinateur), 779 px sur 844 px (téléphone).
- La scène du mot prend toute la hauteur qui reste (`flex: 1`). `js/footer-fx.js` ne fixe plus sa hauteur : il lit celle qui reste et ne règle que la hauteur minimale (mot + un minimum de place pour les objets).
- **Ordinateur** : le logo est au-dessus, le slogan sur une ligne avec les icônes à droite (au lieu de deux lignes + icônes dessous) : on gagne ~200 px de hauteur. Slogan un peu plus petit (`clamp(1.5rem, 2.5vw, 3rem)`, 40 px à 1597 px) ; réglage dans le bloc « V31 » en fin de `css/style.css`.
- **Téléphone / tablette** : même empilement qu'avant (logo, slogan, icônes), slogan limité aussi par la hauteur de l'écran. Écran bas (≤ 700 px de haut, ex. 360 × 640) : haut et barre du bas resserrés.
- Mesuré (hauteur du pied de page = hauteur de l'écran) : 1597×738, 1366×640, 1280×720, 1920×950, 768×1024, 390×844, 430×932, 412×915, 375×667, 360×640. Écran paysage très bas (844×390) : le pied de page dépasse l'écran (il faut défiler) plutôt que d'écraser le mot.

## Objets : la disposition de la capture
- **7 objets**, reproduits d'après la capture (position, rotation et taille ajustées par comparaison avec l'image) : écran, carnet de code, graphique en haut ; loupe et mallette à droite ; ampoule et poignée de main posées sur les lettres. Réglage : `SET_DESKTOP` dans `js/footer-fx.js`.
- **L'objet « argent » n'est plus dans le pied de page** : il n'apparaît pas sur la capture.
- Les positions sont données en part de la largeur (x) et de la hauteur libre au-dessus du mot (y) : la disposition se répartit sur tout l'écran, et les objets rétrécissent un peu quand l'écran est bas (`rig()`).
- **Téléphone** : les mêmes 7 objets (4 avant), en quinconce sur la hauteur de l'écran (`SET_PHONE`).
- Un objet que la personne a déplacé garde sa place quand la fenêtre change de taille ; les autres reprennent leur place d'origine.

## Fichiers
`css/style.css` (bloc V31 en fin de fichier), `js/footer-fx.js`, ce fichier.
