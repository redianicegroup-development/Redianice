# Modifications du 10/11/2026 — V8 → V9 (équipe, fiches, pages produit)

Base : redianice-site_V8-equipe.zip (textes de la V8 conservés tels quels).

## Équipe (accueil)
- **Révélation d'image** : au survol (souris) ou au toucher (mobile), le portrait apparaît en cercle qui grandit depuis le point survolé/touché ; le rôle, le nom et la description s'effacent ; un bouton « Voir la fiche » apparaît.
- **Clic** : souris = un clic ouvre la fiche. Mobile = 1er toucher révèle, 2e toucher ouvre la fiche (un toucher ailleurs referme). Clavier : le focus révèle la carte.
- **Photos** : dépose `elvis.jpg`, `chef-projet.jpg`, `graphiste-1.jpg`, `graphiste-2.jpg` dans `assets/team/` (voir LISEZ-MOI.txt) : aucun code à toucher. Tant qu'un fichier manque, le portrait neutre s'affiche (4 erreurs 404 dans la console, sans conséquence).

## Fiches équipe (`/equipe/<nom>/`) — refaites
Même habillage que le site (menu, bandeau, pied de page). Portrait qui se dévoile, rôle, « Son rôle chez Redianice », parcours (frise), contact (écrire, copier l'adresse, WhatsApp), liens, puis « Découvrir les autres membres » (cartes à révélation d'image). Les contenus absents (nom, parcours, liens des 3 autres membres) affichent un encart « à venir » ; ces 3 fiches sont en `noindex` tant qu'elles ne sont pas complétées. Le contact affiché est celui de Redianice.

## Page Mon E-Carnet
- **Sommaire collant** (puces défilantes, section en cours surlignée, clic = défilement doux) et **barre de progression** de lecture.
- **Captures** : flèches + compteur « 1 / 7 », agrandissement plein écran (flèches, glisser, Échap, légende).
- **Apparition douce** des blocs au défilement (désactivée si « réduire les animations »).
- Bloc « Rencontrer l'équipe de Redianice » en bas (cartes à révélation d'image).

## Correctifs
- Le logo du menu était invisible sur les bandeaux bleu ciel des sous-pages (blanc sur bleu clair) : version foncée tant que le bandeau est derrière l'en-tête.
- Pied de page des sous-pages : même phrase d'accroche que l'accueil.
- `sitemap.xml` : fiche de M'Bollo Aka Elvis ajoutée.

## Fichiers
index.html, css/style.css, js/main.js, produits/e-carnet/, equipe/*/, investir/, mentions-legales/, confidentialite/, 404.html, portfolio/e-carnet/, sitemap.xml, assets/team/LISEZ-MOI.txt.

## Mise à jour : photos et contenu des fiches
- **Photos ajoutées** : `assets/team/elvis.jpg` (M'Bollo Aka Elvis) et `assets/team/graphiste-2.jpg` (graphiste freelance), recadrées en 4:5. Restent à ajouter : `chef-projet.jpg` et `graphiste-1.jpg`.
- **Fiche de M'Bollo Aka Elvis** : parcours (études en réseau et sécurité informatique, 2022 premier projet freelance, 2023 premières applications métier, 2024 AKATech devient une agence, aujourd'hui développeur freelance à AKATech Studio et cofondateur de Redianice, plus de 10 clients et PME), réalisations choisies, contact et liens d'AKATech Studio (e-mail, WhatsApp, LinkedIn, GitHub, portfolio), carte du studio avec l'affiche AKATech (`assets/akatech-studio.webp`). Informations reprises du site AKATech (historique, projets, contact) et du profil GitHub.
- **Fiche du graphiste (2e)** : freelance, chartes graphiques et branding ; texte « Ce qu'il fait » rédigé sans fait inventé ; nom, parcours et liens à venir (fiche en `noindex` tant que le nom manque). Texte passé au masculin.
- README : lignes `equipe/` et `assets/team/` ajoutées.

## V10 → V11 : retours sur les captures

### Fiches équipe
- **« Réalisations choisies »** retirée (fiche de M'Bollo Aka Elvis).
- **« Contact » et « Liens » fusionnés** en une seule section « Contact et liens » : une rangée d'icônes, sans adresse ni numéro écrits, et plus de bouton « Copier l'adresse ». Elvis : e-mail, WhatsApp, LinkedIn, GitHub, portfolio (e-mail et WhatsApp d'AKATech Studio). Les trois autres fiches : e-mail, WhatsApp et LinkedIn de Redianice.
- **Facebook** : le site ne contient aucune adresse de page Facebook. L'icône est prête, en commentaire (`<!-- Facebook … -->`) dans la rangée d'icônes de chaque fiche : remplacer `URL_FACEBOOK` et retirer les balises de commentaire.
- **Carte AKATech Studio** : l'affiche est remplacée par le logo (`assets/akatech-logo.webp`, fond transparent). `assets/akatech-studio.webp` n'est plus utilisée et a été retirée.

### Page Mon E-Carnet
- **Sommaire** (Le problème, Objectifs, Conception…) : il ne suit plus le défilement. Il reste en haut de l'article, avec tous les repères visibles (retour à la ligne, plus de défilement horizontal). Un clic défile toujours doucement jusqu'à la section.

### Cartes équipe (accueil, Mon E-Carnet, bas des fiches)
- **Portrait toujours visible**, en plein cadre ; le rôle est une petite pastille discrète en haut à gauche.
- **Survol (souris) ou toucher (mobile)** : un dégradé léger monte depuis le bas et le nom, l'intitulé et la description s'affichent en bas de la carte, avec un bouton **« En savoir plus »** discret.
- Souris : le clic ouvre la fiche. Mobile : 1er toucher = infos, 2e toucher ou bouton = fiche (un toucher ailleurs referme).

### Fichiers modifiés
index.html, css/style.css, js/main.js, produits/e-carnet/index.html, equipe/*/index.html, assets/akatech-logo.webp (nouveau), assets/akatech-studio.webp (retiré).

## V11 → V12 : lecture des pages produit et fiches, cartes équipe

### Pages produit (Mon E-Carnet) et fiches équipe : illumination du texte
- **Illumination au défilement** : le texte s'allume mot à mot au fil du défilement, bloc par bloc (même effet que « Redianice conçoit, teste et lance… » sur l'accueil). Elle concerne les paragraphes et les puces des sections de lecture de la page Mon E-Carnet, et le texte des fiches (« Son rôle », frise du parcours). L'icône d'une puce s'allume avec son premier mot.
- **Lisibilité** : les mots non encore allumés restent à 40 % d'opacité (30 % sur l'accueil), pour qu'un texte long reste lisible à tout moment.
- **Ne sont pas concernés** : titres, boutons, texte du bandeau d'introduction, note sous les icônes de contact, étapes synchronisées avec l'animation « Parcours explorés ».
- **Désactivé** si « réduire les animations » est actif, sans JavaScript, ou quand le visiteur traduit la page (la traduction du navigateur remplace les mots).
- Le fondu d'entrée des paragraphes et des listes est remplacé par l'illumination (les titres gardent leur apparition douce).

### Page Mon E-Carnet : sommaire en puces retiré
- Les puces « Le problème, Objectifs, Conception… » sont supprimées (HTML, JS, CSS). Les titres gardent leur `id` (liens directs `#objectifs`, etc.) et la **barre de progression de lecture** reste.
- Attributs `data-toc` retirés ; `data-toc-host` devient `data-progress`.
- Les puces de liste sans `<span>` sont enveloppées dans un `<span>` (mise en page inchangée, nécessaire pour l'illumination).

### Cartes équipe (accueil, Mon E-Carnet, bas des fiches)
- Ne restent que le **rôle** (pastille en haut à gauche) et le **nom et prénom** (affiché au survol ou au toucher, avec « En savoir plus »). L'**intitulé** (ex. « Développeur web · cofondateur ») et la **description** sont retirés.
- Le nom devient le titre de la carte (`<h3 class="card__name">`), en plus grand.
- Les trois membres dont le nom n'est pas encore connu n'ont que la pastille et « En savoir plus ». Pour ajouter un nom, dans la carte : `<div class="card__body"><h3 class="card__name">Prénom Nom</h3></div>` juste après la pastille `<span class="card__idx">…</span>`.

- Libellés d'accessibilité (`aria-label`, `alt`) des cartes alignés : ils ne reprennent plus les intitulés retirés (« pilotage et droit », « identité visuelle », « chartes graphiques et branding »).

### Page Mon E-Carnet : « Quelques aperçus de la version pilote » avec l'effet gravity (WebGL)
- **Même effet que le HTML fourni** (`webgl_carousel_20_variants…`, préréglage **gravity**) : les captures passent dans une lentille qui courbe les cartes et sépare légèrement les couleurs sur les bords. Entrée « rise » (les cartes montent), ressort et déformation « liquide » au glisser.
- **Interactions** : glisser (souris ou doigt), molette horizontale / pavé tactile, flèches du clavier (← → Début Fin), clic ou Entrée sur la carte centrale pour l'agrandir (re-clic ou Échap pour refermer). La molette verticale fait toujours défiler la page.
- **Boutons** : précédent, **Pause / Lecture**, suivant. La lecture automatique s'arrête au survol, au focus et pendant une interaction ; elle est désactivée si « réduire les animations » est actif.
- **Légendes** : titre et description de chaque capture, compteur animé « 02 / 07 ». Les lecteurs d'écran annoncent la capture (titre, position, texte alternatif) lorsqu'on navigue.
- **Sans bibliothèque externe** : `js/gravity-carousel.js` embarque une petite couche WebGL2 à la place d'OGL (rien à charger depuis un CDN, aucun changement de politique de sécurité).
- **Chargement** : le carrousel ne se monte qu'à l'approche de la section (les 7 images ne se téléchargent pas avant). Il lit les captures déjà présentes dans le HTML (`.shots` : image, titre, description) : ajouter ou retirer une `<figure class="shot">` suffit.
- **Écrans étroits** : la lentille est élargie (sans changer la courbure) pour que la carte centrale reste nette sur téléphone.
- **Repli** : sans WebGL2, ou si le contexte graphique est perdu, l'ancienne galerie (défilement horizontal, flèches, compteur, agrandissement plein écran) reprend automatiquement.
- Hauteur : `clamp(540px, 48vw, 740px)` (réglable dans `css/style.css`, section « galerie gravity »). Style des cartes : coins arrondis de 20 px ; réglages de la lentille en tête de `js/gravity-carousel.js` (`GRAVITY`).

### Fichiers modifiés
index.html, css/style.css, js/main.js, js/gravity-carousel.js (nouveau), produits/e-carnet/index.html, equipe/*/index.html (4), README.md, MODIFICATIONS-2026-11-10.md.

### À savoir
- Le zip V11 contenait un fichier `.env` (clés du formulaire de contact). Il n'est **pas** dans la V12. S'il a été partagé, régénérer la clé Resend.
- Les captures de Mon E-Carnet (`assets/captures/`) ne sont pas dans ce zip : la galerie les lit au même emplacement qu'avant (mêmes noms de fichiers). Sans elles, les cartes s'affichent en couleur unie.

## V12 → V13 : deux couleurs, hero à objets 3D, footer interactif

### Palette : deux couleurs seulement
- **Blanc cassé** `#f3efe7` (`--paper`) pour tous les fonds ; **bleu** `#0b3dff` (`--blue`) pour tous les textes, icônes et traits. Les deux valeurs se changent dans `:root` de `css/style.css`.
- Les filets et anneaux utilisent le bleu en transparence (`--line`, `--tint`). Aucune autre teinte dans le CSS.
- **Boutons et états actifs / survol** : inversion des deux couleurs (fond bleu, texte blanc cassé). Pour supprimer tout fond bleu, passer `.pill` en contour (voir le bloc `.pill` dans le CSS).
- Cartes équipe : dégradé blanc cassé sous le nom (au lieu du dégradé sombre), pastille de rôle et bouton « En savoir plus » en blanc cassé avec contour bleu.
- Logo : version bleue (`logo-fonce.png`) partout, y compris dans le footer. Barre du navigateur (`theme-color`) : `#f3efe7`.
- Schéma « Parcours explorés » (Mon E-Carnet) et `assets/team/portrait-a-fournir.svg` recolorés en deux couleurs.
- **Non modifiés** : `og-image.png` et `og-e-carnet.png` (images de partage) gardent l'ancienne palette.

### Hero (accueil) : objets 3D
- 9 objets (`assets/objets/`) flottent en permanence, puis suivent le défilement à des vitesses et rotations différentes, avec une secousse élastique selon la vitesse du scroll. Ils passent par-dessus la section suivante (calque `.hero-objs`, au-dessus des sections, en dessous du menu).
- Réglage de chaque objet dans `index.html` : `--x` / `--y` (bureau), `--mx` / `--my` (mobile), `--k` (taille), `data-speed` (> 0 monte plus vite que la page, < 0 reste plus longtemps), `data-spin` (rotation).
- Mobile : 5 objets (classe `hobj--d` = bureau seulement). Écran bas (≤ 680 px de haut) : on masque aussi `hobj--t` pour libérer le titre et les boutons.
- Sans JS, avec « réduire les animations » ou sans GSAP : objets statiques. Calque masqué une fois le hero loin derrière.

### Footer (toutes les pages) : filigrane et objets déplaçables
- Grand mot « redianice » (texte dans `data-text` du bloc `.foot__stage`) dessiné en canvas, avec l'effet de `redianice.html` : lettre survolée (ou balayée automatiquement) en contour pointillé avec cadre de sélection, lettre déplaçable qui revient en rebondissant, clic = vague.
- 6 objets déplaçables (souris ou doigt, inertie et rebond sur les bords), tirés au hasard parmi 25 ; toutes les 10 s, 6 autres les remplacent (jamais un objet tenu en main). Le lot suivant est préchargé. Constantes `PER` et `EVERY` en tête de `js/footer-fx.js`.
- Le grand « redianice » avec l'icône du bloc Contact (accueil) est retiré : il faisait doublon.
- Décoratif : masqué aux lecteurs d'écran, pas de manipulation au clavier. « Réduire les animations » : pas de balayage, de vague, d'inertie ni de flottement.
- Chargement : le script ne démarre qu'à l'approche du footer ; images des objets de 28 Ko en moyenne.

### Fichiers
Nouveaux : `js/hero-objets.js`, `js/footer-fx.js`, `assets/objets/*.webp` (25). Modifiés : `css/style.css`, `index.html`, les 10 autres pages (footer, scripts, `theme-color`), `produits/e-carnet/index.html` (schéma), `assets/team/portrait-a-fournir.svg`, `README.md`, ce fichier.

### À savoir
- `assets/captures/`, `assets/team/chef-projet.jpg` et `assets/team/graphiste-1.jpg` ne sont pas dans le zip : ces images restent à remettre (le site utilise le portrait « à fournir » à la place).

## V13 → V14 : fond animé du hero, titres en noir

### Hero (accueil) : fond animé
- **Même animation que `backgroung_hero.html`** (composant « GradientASCII », forme *horizon*, caractères de 18 px, lueur 0,3, réaction au survol et au clic), réécrite en JavaScript pur dans `js/hero-bg.js` : pas de React ni de Babel, rien à charger depuis un CDN. Mêmes shaders WebGL2 et mêmes couleurs (`#1e3fd8`, `#f6f8ff`, `#a5d8ff`, `#38bdf8`) que la démo ; le fond de la page reste le blanc cassé, les zones vides du halo sont transparentes.
- Le halo est **derrière le texte et derrière les objets 3D** (`<div class="hero__bg" data-hero-bg>` dans `index.html`).
- **Économie** : le dessin s'arrête dès que la section suivante recouvre le hero (le hero reste fixe pendant le défilement), quand l'onglet est masqué, et reprend au retour. « Réduire les animations » : image fixe, sans mouvement. Sans WebGL2 : dégradé CSS fixe.
- **Police des caractères** : la démo utilise Geist Mono (Google Fonts). Le site n'appelant aucun service externe, le script prend Geist Mono si elle est installée, sinon la police monospace du système (Menlo, Consolas…). Pour avoir exactement Geist Mono : ajouter le fichier `.woff2` dans `assets/fonts/` et une règle `@font-face` « Geist Mono » dans `css/style.css`.
- Réglages (`DEFAULTS` en tête de `js/hero-bg.js`) : `colors`, `shape`, `cellSize`, `speed`, `glow`, `mouseInteraction`, `lightMode`. La résolution est plafonnée à 1,75 pixel par pixel d'écran.
- Le bouton contour du hero (« Parler d'un partenariat ») a un fond blanc cassé plein pour rester lisible devant le halo.

### Titres et sous-titres en noir
- Nouvelle variable `--ink:#0a0a0a` dans `:root`. Titres (h1 à h4, titres de sections, questions de la FAQ, accroche du footer, noms sur les cartes équipe), sous-titres (phrase sous le titre du hero et des pages, rôle sous le nom d'un membre, titres des étapes et des puces) et grande phrase d'ouverture de la mission passent en noir. Tout le reste du texte, les icônes, les traits et les boutons restent en bleu.
- Bloc « Titres en noir » en fin de `css/style.css`. Pour revenir à des titres bleus : `--ink:var(--blue)` dans `:root`.

### Cartes équipe
- Rien à changer : la V13 n'affiche déjà que le rôle (pastille) et le nom et prénom. La phrase d'introduction de la section dit maintenant « afficher le nom du membre ».

### Fichiers
Nouveau : `js/hero-bg.js`. Modifiés : `css/style.css`, `index.html`, `README.md`, ce fichier.

