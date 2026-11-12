# V27 → V28 : sections séparées, dégradé du hero au survol, footer, en-tête qui s'efface

## Accueil : « À propos » (zigzag de la marque)
- Le zigzag de la marque s'arrête maintenant à « De l'observation à la solution. » (dernière sous-section de `#apropos` : À propos, Mission, Vision, De l'observation à la solution).
- **« Notre méthode »**, **« Notre approche : de l'idée au produit »** et **« Les débuts de Redianice »** sont trois sections à part (`#methode`, `#approche`, `#debuts`), avec exactement le padding des autres sections (« Grandir à plusieurs », Produits, etc.) : 160 px haut/bas et 72 px de côté sur ordinateur, 72 px et 20 px sur téléphone (mesuré). Classe `about--solo` ; styles de texte identiques à avant.
- `aria-label` de la liste des 4 étapes : « Notre approche » (au lieu de « Notre méthode »).

## Survol des cartes en grille : même dégradé bleu que le fond du hero
- Mêmes bleus que le hero (`#7b97ff`, `#f6f8ff`, `#b4dcff`, `#7fd3fb`, voir `DEFAULTS` dans `js/hero-bg.js`), plus légers pour garder le texte lisible.
- Appliqué à : cartes produit (Mon E-Carnet et « Projet en exploration »), les 4 étapes de « Notre approche », cartes Investir (`.deal`), étapes (`.steps`) et cartes « Ce qu'il fait » des fiches équipe. Le dégradé apparaît en fondu et suit le pointeur (souris ; au toucher, il apparaît au contact).
- Réglage : bloc « 2) Survol » en fin de `css/style.css` (opacités `.5`, `.26`, etc.) ; suivi du pointeur : `js/main.js`.
- Non touchées : cartes d'équipe à photo (elles ont déjà leur propre survol) et boutons.

## Pied de page (11 pages)
- **Fusée et globe retirés** du pied de page (`js/footer-fx.js`) : 8 objets sur ordinateur (2 rangées de 4), 4 sur téléphone (en quinconce). Le hero garde les siens.
- **Slogan en noir** (`.foot .foot__tag`), plus grand, retour à la ligne équilibré.
- **Interface reprise** : coins du haut arrondis comme les sections, icônes sociales de 48 px qui se soulèvent au survol, halo bleu discret derrière le filigrane, barre du bas en deux lignes sur téléphone (copyright, puis mentions légales + « Haut de page » sur la même ligne), flèche de « Haut de page » animée, soulignement des liens légaux au survol.
- **L'en-tête (logo + Menu) s'efface quand le pied de page arrive** (son bord haut passe sous 70 % de la hauteur de l'écran) et revient en remontant. Il reste affiché si le menu mobile est ouvert. Toutes les pages. Réglage : `js/main.js` (0.7), classe `.is-away` dans `css/style.css`.

## Fichiers
`index.html`, `css/style.css`, `js/main.js`, `js/footer-fx.js`, ce fichier.
