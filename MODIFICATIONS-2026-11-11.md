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


# V17 → V18 : statut collaborateur, textes des fiches, réalisations, page produit allégée

## Statut
- **« Collaborateur » pour les quatre membres** : « cofondateur » retiré partout (fiches, cartes de l'accueil et de la page produit, JSON-LD, llms.txt, llms-full.txt). Juriste : « Juriste · collaborateur » ; graphistes : « collaboratrice » / « collaborateur ».
- Fiche juriste : h1 « Juriste de Redianice », plus de « pilotage » ni de « chef de projet » (texte aligné sur le modèle : contribution juridique). Le slug `/equipe/chef-de-projet/` est conservé (page en noindex) ; à renommer quand les noms seront connus.

## Fiches équipe (structure : portrait et rôle, Son rôle, Réalisations, Contact)
- « Son rôle » = présentation + responsabilités fusionnées (1 paragraphe + 4 points maximum). Section « Parcours » supprimée partout.
- **Réalisations** : Elvis = « Chez Redianice » (Mon E-Carnet) et « Hors Redianice » (Kôkô Eats, REKOLLECTE, Vazi Express, Nexura) dans la galerie WebGL « gravity », avec le nom du projet sur chaque carte en attendant les logos. Les trois autres fiches : « Ses réalisations seront présentées ici prochainement. »
- Prochaine étape prévue : clic sur un projet = détail puis liens. Aujourd'hui le clic agrandit la carte.

## Page Mon E-Carnet (galerie et parcours animés non touchés)
- « Conception et développement » + « Démarche de développement » regroupés dans un bloc repliable « Détails techniques » ; bloc « Un premier produit en phase pilote » supprimé (doublon de « État actuel ») ; le lien Investir passe sous « À quoi pourrait servir un accompagnement ? ». Le statut « phase pilote » est inchangé.

## Fichiers
Nouveaux : `js/realisations.js`, `assets/realisations/LISEZ-MOI.txt`. Modifiés : `css/style.css`, `js/main.js` (le texte du bloc repliable n'est pas concerné par l'illumination au défilement), `js/gravity-carousel.js` (libellés des boutons paramétrables, comportement des captures identique), `index.html`, `produits/e-carnet/index.html`, `equipe/*/index.html`, `llms.txt`, `llms-full.txt`, `assets/team/LISEZ-MOI.txt`, `README.md`, ce fichier.


# V18 → V19 : fiches équipe sans section « Réalisations »

- **Section « Réalisations » retirée des 4 fiches** (`equipe/chef-de-projet`, `graphiste-1`, `graphiste-2`, `mbollo-aka-elvis`). Structure des fiches : portrait et rôle, Son rôle, Contact et liens.
- Fiche Elvis : le bouton du haut « Réalisations et liens » devient « Contact et liens » (ancre `#contact`) ; les descriptions (meta, Open Graph, Twitter) ne parlent plus de réalisations. La carte « Mon E-Carnet » et la galerie WebGL des projets hors Redianice disparaissent avec la section ; la carte AKATech Studio reste.
- Nettoyage : `js/realisations.js` et `assets/realisations/` supprimés, scripts `realisations.js` et `gravity-carousel.js` retirés de la fiche Elvis (la galerie reste utilisée par la page Mon E-Carnet), règles CSS `.real`, `.tp-real`, `.tp-empty` retirées, lignes correspondantes retirées du README.


# V19 → V20 : contenu centré (FAQ, fiches perso, pages produit)

- **Colonne centrée** au lieu d'une colonne collée à gauche avec du vide à droite : FAQ de l'accueil (étiquette, titre et questions sur le même axe, largeur 62 rem), corps des pages documents (`.sec.doc` : Mon E-Carnet, fiches perso, et par cohérence Investir, mentions légales, confidentialité) sur une colonne de 46 rem avec bords alignés (paragraphes, listes, cartes, repliable), en-têtes des pages produit et documents sur la même colonne, en-tête des fiches perso (fil d'Ariane + portrait et texte) centré sur 76 rem.
- Inchangés : galerie WebGL « gravity » (déjà pleine largeur, centrée), « Comment ça marche » (centré, jusqu'à 64 rem), cartes d'équipe, autres sections de l'accueil.
- Réglage : variables `--col` (46 rem) et `--col-wide` (76 rem) et bloc « V19 » en fin de `css/style.css`.
- Contrôlé aux largeurs 390, 768, 1440 et 1920 px sur 9 pages : aucun débordement horizontal, blocs centrés à 12 px près.


# V20 → V21 : même padding que « Mission » partout, contact sans liens, icônes du footer sous le slogan

- **Padding uniforme de Mission à Contact** : les six sections de l'accueil (Mission, Produits, Investir, Équipe, FAQ, Contact) ont maintenant exactement le padding de Mission (160 px haut/bas et 72 px de côté sur ordinateur, 72 px et 20 px sur mobile), et leur contenu part du même bord. Mesuré à 1440 px et 390 px. Changements : Contact reprend le padding de haut des autres (il était réduit à 110 px) ; la FAQ n'est plus limitée à 62 rem ni centrée (le réglage de la V20 est annulé pour elle), elle occupe toute la largeur comme les autres sections.
- **Section Contact** : les icônes Gmail, WhatsApp et LinkedIn sont retirées (il reste le titre, le texte et le formulaire).
- **Footer (11 pages)** : les icônes Gmail, WhatsApp et LinkedIn passent sous le slogan, dans la colonne de la marque ; la colonne de droite (`.foot__contact`) est supprimée, ainsi que les règles `.social`, `.foot__contact` et la grille à deux colonnes du footer dans `css/style.css`.


# V21 → V22 : pages et slug avec le même padding que « Mission »

- **Pages documents** (Mon E-Carnet, 4 fiches perso, Investir, mentions légales, confidentialité) : le centrage en colonne étroite de la V20 est retiré. Les bords gauche/droite sont ceux de Mission (72 px sur ordinateur, 20 px sur mobile), en-têtes compris (fil d'Ariane, titre, portrait). Mesuré sur les 9 pages à 1440 et 390 px : même bord gauche partout, aucun débordement.
- **Haut et bas** : les sections de ces pages ont aussi les 160 px de Mission (72 px sur mobile) au lieu de 96 / 100 px ; seul le haut de l'en-tête reste à 130 px pour dégager la barre de navigation.
- **Blocs sur toute la largeur** : listes, cartes de rôle, bloc repliable, carte AKATech Studio, étapes. Les cartes « Son rôle » passent sur deux colonnes dès 900 px. Le texte courant garde sa longueur de ligne (42 em), comme les textes d'introduction de Mission.
- Réglage : bloc « V22 » en fin de `css/style.css` ; les variables `--col` et `--col-wide` de la V20 n'existent plus.
