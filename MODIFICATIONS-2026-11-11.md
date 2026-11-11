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


# V22 → V23 : en-tête, hero, étiquettes, titres, textes noirs, pied de page, fiche Elvis

## En-tête (toutes les pages)
- **Logo seul, sans le nom « redianice »**, et plus grand : 52 px sur téléphone, jusqu'à 64 px sur ordinateur (variable `--logo-h`, en haut du CSS). Nouveau fichier `assets/mark-fonce.png` (la marque de `logo-fonce.png`, en bleu du site). Le lien garde son libellé « Redianice, accueil » pour les lecteurs d'écran. La marque a un fond blanc cassé : les traits des sections qui défilent derrière ne la traversent plus.
- **Bouton Menu (téléphone) sans contour bleu**, centré sur la hauteur du logo. Le menu de la version ordinateur n'a pas changé. Le logo du pied de page garde le nom.

## Hero (accueil)
- **Le grand titre est remplacé par le même filigrane que le pied de page** (mot « redianice » en contour pointillé, lettre survolée ou balayée qui se renforce). Le titre « Des solutions pour des problèmes concrets » reste dans le HTML, invisible (`h1.sr`), pour les lecteurs d'écran et le référencement. La pastille qui changeait de logo dans le titre est retirée (HTML, CSS, JS).
- Chapô en **noir**.
- `js/footer-fx.js` gère maintenant plusieurs scènes : une scène sans calque `.foot__objs` (le hero) n'affiche que le filigrane.

## Pied de page : plus de hasard
- **Mêmes objets que le hero, toujours aux mêmes places** : plus de tirage au sort, plus de renouvellement toutes les 10 s. Ordinateur : ampoule, écran, loupe, carnet de code, poignée de main, argent, graphique, mallette, fusée, globe (deux rangées). Téléphone : ampoule, poignée de main, fusée, loupe, argent, globe. Les objets restent déplaçables à la main.
- Objets un peu plus grands sur téléphone. Réglage : `SET_DESKTOP`, `SET_PHONE`, `objUnit` et `headroom` dans `js/footer-fx.js`.

## Étiquettes entre crochets et titres de sections
- **Les 17 petites étiquettes `[ ]` sont supprimées** (accueil, Investir, Mon E-Carnet, 4 fiches, page portfolio) ainsi que leur CSS.
- **Titres plus courts** (accueil) : « Un premier projet. Une ambition concrète. » → « Notre premier produit. » ; « Quatre personnes. Des compétences qui se complètent. » → « Quatre profils complémentaires. » ; « Les bonnes idées grandissent avec les bonnes collaborations. » → « Grandir à plusieurs. »
- Phrase d'aide des cartes équipe (« Survolez une carte… ») retirée.

## Textes en noir
- Chapô du hero, textes de la Mission et chapô des fiches : noir. Titres, boutons et liens restent bleus. Les autres chapôs (Investir, Mon E-Carnet) restent bleus.

## Fiche Elvis
- **Chapô** : plus de « Chez Redianice, il conçoit et développe les produits… ». Il présente la personne : développeur web freelance à AKATech Studio, plus de 10 clients et PME : sites vitrines, e-commerce et applications web.
- **Son rôle** (réécrit) : « Développeur full-stack orienté produit, il transforme un besoin identifié en application : il réfléchit à la solution technique, la conçoit, la développe, puis la fait évoluer au fil des retours. »
- **Description du rôle en grand, avec l'illumination de la Mission** : le paragraphe de rôle et les descriptions des quatre cartes (taille de la Mission sur téléphone ; plafonnées à 2,8 rem et 2,2 rem sur ordinateur). Mêmes réglages de défilement que la Mission (début à 80 %, fin à 50 % de l'écran, mots non allumés à 30 %). Réglage : bloc « V18 » en fin de `css/style.css` et `big` dans `js/main.js`.
- Même mise en forme sur les trois autres fiches (leur texte n'a pas changé).

## Fichiers
Nouveau : `assets/mark-fonce.png`. Modifiés : `index.html`, `404.html`, `investir/`, `portfolio/e-carnet/`, `produits/e-carnet/`, `mentions-legales/`, `confidentialite/`, `equipe/*/`, `css/style.css`, `js/main.js`, `js/footer-fx.js`, `README.md`, ce fichier.


# V23 → V24 : section « À propos », titre « Mission », en-tête sans fonds

## Accueil
- **Nouvelle section « À propos »** (`#apropos`) placée juste après le hero, sur la page d'accueil (pas de page séparée) : « Redianice est né d'un coup de tête entre quatre personnes autodidactes qui voient grand… ». Même mise en forme et même effet d'illumination que la Mission.
- **Titre « Mission » visible** au-dessus de « Derrière chaque difficulté… » (l'ancien titre masqué « Tout commence par un problème. » est remplacé).
- **Bloc « Vision »** (texte proposé, à valider) sous la Mission, avant « De l'observation à la solution. ».
- Lien « À propos » ajouté dans le menu (ordinateur et téléphone) des 11 pages, avant « Mission ».

## En-tête (toutes les pages)
- **Logo** : plus de fond blanc cassé ni de coins arrondis derrière la marque (il ne reste que son cadre bleu). Contrepartie : les textes qui défilent derrière le logo passent maintenant à travers.
- **Bouton Menu (téléphone)** : plus de pastille blanc cassé, seul le mot « Menu » reste. Le panneau ouvert garde son fond et le bouton « Fermer » reste bleu. Le menu de la version ordinateur n'a pas changé.

## Fichiers
`index.html`, `404.html`, `investir/`, `mentions-legales/`, `confidentialite/`, `produits/e-carnet/`, `portfolio/e-carnet/`, `equipe/*/` (lien de menu), `css/style.css`, ce fichier.
