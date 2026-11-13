# V37 → V38 : inclinaison 3D des cartes retirée, logos en aberration chromatique

## Retiré
- L'inclinaison 3D des cartes au passage de la souris (cartes produit, cartes équipe sur grand écran, puces des fiches) est supprimée du code (`js/souris.js`). Les cartes gardent leurs survols d'origine (bordure, halo, révélation de l'image).

## Ajouté : logos chromatiques (`js/souris.js` + CSS, bloc V37)
- En-tête, menu plein écran et pied de page : au survol de la souris, le logo se dédouble en deux copies, rouge et cyan, qui se décalent de part et d'autre selon la position de la souris sur le logo (3 px au maximum, toujours un peu visible), puis reviennent à zéro quand la souris part.
- S'ajoute à la lentille du curseur, qui inverse déjà les couleurs du logo (le logo agrandit la lentille, comme dans `bon.html`).
- Même règle qu'avant : uniquement avec une vraie souris et sans « réduire les animations ».
- Réglages en tête de `js/souris.js` : `CHROMA` (logos concernés), `CHROMA_MAX` et `CHROMA_MIN` (décalage en px). Couleurs des deux copies : règle `.is-chroma img` dans `css/style.css`.

## Inchangé
Curseur inversé + lentille, boutons magnétiques (dont « Menu »), parallaxe du hero et des portraits, mots clés entourés, textes, bouton « Contact », pied de page mobile compact.

## Fichiers
Modifiés : `js/souris.js`, `css/style.css` (bloc V37), `README.md`.
