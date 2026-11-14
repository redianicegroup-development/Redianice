# V43 → V44 : menu simplifié, logo en négatif, fiches équipe, hero sans soulignage

## Menu (`css/style.css`, toutes les pages)
- Les petits liens (Investir, FAQ, Mentions légales, Confidentialité) sont retirés du menu. Les mentions légales et la confidentialité restent dans le pied de page.
- Les icônes réseaux (Gmail, WhatsApp, LinkedIn, Instagram, TikTok) prennent leur place ; « © 2026 Redianice » est tout en bas.

## Logo de l'en-tête (`css/style.css`, `js/main.js` inchangé)
- Accueil : le logo est masqué tant que le hero occupe l'écran (`body.in-hero`, seuil `HERO_MENU_AT` dans `js/main.js`, le même que le bouton Menu).
- Ailleurs : effet négatif (`mix-blend-mode: difference`, comme le curseur) : sombre sur fond clair, doré sur le bleu, couleurs inversées sur les photos.
- Le glitch chromatique au survol (rouge/cyan, `js/souris.js`) est conservé et s'ajoute au négatif.
- Technique : pour que le mélange agisse sur la page, l'en-tête n'est plus un bloc fixe, seul le logo l'est. Couches : logo 997, panneau 998, bouton Menu 999 (loader, curseur et aperçus restent au-dessus).

## Hero (`js/highlight.js`)
- Plus de soulignage SVG sur « produits numériques » dans le hero. Les autres mots clés gardent le leur.

## Équipe (`equipe/*`, `index.html`, `produits/e-carnet`, `llms*.txt`)
- Fiche de M'Bollo Aka Elvis : bouton « Lui écrire » à la place de « Contact ».
- Statut du CEO en anglais : « Founder of Redianice & Legal Officer » (cartes, titres, fil d'Ariane, balises de partage, JSON-LD, llms).
- Fiches sans contacts personnels (CEO, graphistes) : plus de bouton « Lui écrire » ni de bloc « Contact et liens » (donc plus les coordonnées de Redianice). Le bouton « Toute l'équipe » reste.
  Pour ajouter des contacts à un membre : reprendre le bloc `#contact` et le bouton `.tp-actions` de `equipe/mbollo-aka-elvis/index.html`.

## Pied de page en deux parties (`css/style.css` bloc V44, toutes les pages)
- Partie 1 (`.foot__top`) : à gauche le logo combiné et le slogan ; au milieu « Légal » (Mentions légales, Confidentialité) ; à droite « Contact » (Gmail, WhatsApp, LinkedIn, Instagram, TikTok). Un filet fin la sépare de la partie 2.
- « Haut de page » devient un simple bouton flèche (rond, `aria-label` conservé), au même niveau : à l'extrémité droite de la ligne sur ordinateur, en haut à droite à côté du logo sur téléphone.
- Téléphone : logo + flèche sur la première ligne, puis slogan, liens légaux (sur une ligne), puis icônes de contact.
- Partie 2 inchangée : scène du mot « redianice » avec les 7 objets (mêmes positions, toujours déplaçables, `js/footer-fx.js` non modifié), puis « © 2026 Redianice. Tous droits réservés. Créé par AKATech Studio ».
- Le pied de page reste à la hauteur d'un écran sur ordinateur.

