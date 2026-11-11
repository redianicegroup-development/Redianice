# Modifications du 11/11/2026 — V14 → V16 (pied de page, confidentialité, couleurs)

## Pied de page (toutes les pages)
- Retiré : le paragraphe « Redianice est une startup indépendante basée à Abidjan… ».
- Retiré : le bloc texte « Nous écrire » (titre, adresse e-mail, ligne WhatsApp). Les icônes Gmail, WhatsApp et LinkedIn restent.
- CSS : règles devenues inutiles supprimées (`.foot__about`, `.foot__h`, `.foot__mail`, `.foot__wa`).

## Page confidentialité
- Retiré : la section « Application Mon E-Carnet » (titre et paragraphe). « Dernière mise à jour : novembre 2026 » reste.

## Fichiers
index.html, 404.html, investir/, mentions-legales/, confidentialite/, produits/e-carnet/, portfolio/e-carnet/, equipe/*/, css/style.css.

## Couleurs : titres et sous-titres en bleu, texte en noir (css/style.css)
- Bloc « Titres en bleu, texte en noir » en fin de fichier, à la place de l'ancien bloc « Titres en noir ».
- Bleu (--blue) : titres h1 à h4, sous-titres (chapô du hero et des pages, questions de la FAQ, titres de cartes, étapes, accroche du pied de page), étiquettes [entre crochets], fil d'Ariane, badges, boutons, menu, liens, icônes et traits.
- Noir (--ink) : paragraphes, listes, légendes, notes, textes du formulaire, copyright. Les liens dans le texte restent bleus.
- Pour revenir en arrière : voir le commentaire en tête du bloc.

# V16 → V17 : hero, cartes équipe, footer, pages perso

## Hero (accueil)
- **Plus de caractères ASCII** dans le fond animé : seul le halo reste (`glyphOpacity: 0` dans `DEFAULTS`, `js/hero-bg.js`).
- **Bleu atténué** : palette plus claire (`#7b97ff`, `#f6f8ff`, `#b4dcff`, `#7fd3fb`) et opacité du halo à 0,68. Mesuré : le titre bleu garde un contraste d'environ 3 sur la zone la plus soutenue. Le chapô (bleu) a un léger halo blanc cassé (`text-shadow`) pour rester lisible. Pour retrouver la démo : valeurs d'origine indiquées dans le commentaire de `DEFAULTS`.
- **La section Mission recouvre maintenant les objets du hero** : le calque `.hero-objs` passe sous les sections (`z-index:1` au lieu de 3).

## Cartes équipe
- **Rôle ajouté** sur chaque carte, au survol ou au toucher, au-dessus du nom : Juriste, Développeur web, Graphiste, Graphiste (`<p class="card__role">` ; modifiable dans le HTML des cartes : accueil, page Mon E-Carnet, bas des 4 fiches). Les trois cartes dont le nom n'est pas encore connu affichent le rôle seul. La pastille en haut à gauche (Droit, Technique, Design) reste.
- **Le clic sur la carte n'ouvre plus la fiche.** Toucher (ou cliquer) la carte alterne photo et détails, autant de fois qu'on veut. Avec la souris : le survol affiche les détails, un clic les masque, un autre clic les rend ; quitter la carte réinitialise. **Seul le bouton « En savoir plus » ouvre la page du membre.** (`js/main.js`, classes `is-open` / `is-photo`.)

## Footer
- **Filigrane pointillé** : tout le mot « redianice » est dessiné en contour pointillé à peine rempli ; la lettre survolée (ou balayée seule) se renforce, avec cadre de sélection et étincelles comme avant. Pointillés plus fins sur téléphone. Réglage : `WM_DASH` et `WM_FILL` en tête de `js/footer-fx.js`.
- **Plus d'objets** : 9 visibles (7 sur téléphone) au lieu de 6, un peu plus petits, avec plus de place au-dessus du mot sur téléphone.
- Le mot s'affiche correctement dans mes essais (ordinateur, mobile à haute densité). Je n'ai pas pu reproduire son absence sur ton téléphone : à confirmer après mise en ligne.

## Pages perso
- **Effet de `plinch_image.html`** (traînée d'images GSAP) dans l'en-tête de chaque fiche, nouveau fichier `js/trail.js` : des objets suivent le curseur ou le doigt, dérivent, puis disparaissent. Désactivé avec « réduire les animations ».
- **Objets par métier** (attribut `data-trail` de l'en-tête, noms des fichiers de `assets/objets/`) :
  - Juriste (`chef-de-projet`) : loupe, dossier, certificat, balance, marteau de juge, code juridique, liste de contrôle, mallette ;
  - Développeur (`mbollo-aka-elvis`) : écran, clavier, souris, carnet de code, engrenage, icône de téléchargement, fusée, ampoule ;
  - Graphistes (`graphiste-1`, `graphiste-2`) : appareil photo, palette, crayon, stylet, tablette graphique, ampoule. Il n'y a pas de pinceau dans les 25 objets : le crayon et le stylet en tiennent lieu.

## Fichiers
Nouveau : `js/trail.js`. Modifiés : `css/style.css`, `js/main.js`, `js/footer-fx.js`, `js/hero-bg.js`, `index.html`, `produits/e-carnet/index.html`, `equipe/*/index.html`, `README.md`, ce fichier.

