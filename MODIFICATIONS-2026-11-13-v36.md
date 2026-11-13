# V36 — Menu plein écran et crédit « Créé par AKATech Studio »

## Menu plein écran (toutes les pages)
- Nouveau panneau bleu plein écran, sur le modèle de la capture de référence : langues en haut à gauche, logo Redianice au centre (en blanc), bouton « Fermer » en haut à droite.
- Liens principaux très grands, décalés en escalier et séparés par un filet : **À propos, Projets, Équipe, Contact**. Au survol (ou au clavier), les autres liens s’estompent et un losange marque le lien visé. Sur l’accueil, le losange suit aussi la section affichée.
- Bas du panneau : liens secondaires (Investir, FAQ, Mentions légales, Confidentialité) et réseaux sociaux (mêmes liens qu’avant).
- Langue : cinq pastilles FR / EN / AR / ZH / PT. Elles utilisent le même mécanisme de traduction qu’avant (`data-lang`, `js/main.js`). Le sélecteur déroulant `#langSel` est supprimé.
- Le bouton « Menu » reste en bas au centre pour ouvrir ; il s’efface quand le panneau est ouvert (on ferme avec « Fermer », Échap, un lien ou un toucher sur le fond). Le focus clavier reste dans le panneau.
- « Projets » mène à `#produits` partout. Sur la page `portfolio/e-carnet`, l’ancien lien « Nos produits » pointait vers `#portfolio`, une ancre qui n’existe pas : corrigé.
- Sur les pages équipe, produits et investir, le lien de la section correspondante porte le losange.

## Pied de page : « Créé par AKATech Studio »
- Nouvelle mention dans la barre du bas, sur toutes les pages, avec un lien vers https://akatech.vercel.app/ (nouvel onglet).
- Au survol (souris), au toucher maintenu (téléphone) ou au focus clavier, le logo AKATech apparaît près du pointeur et le suit : même effet que sur Mon E-Carnet (`js/credit-reveal.js`).
- Nouveau fichier image : `assets/akatech-studio-logo.webp`.

## Fichiers
- Modifiés : `css/style.css` (anciennes règles du menu retirées, nouveau bloc « V36 » en fin de fichier), `js/main.js` (ouverture/fermeture du panneau, piège de focus, suivi de section), les 11 pages `.html`.
- Créés : `js/credit-reveal.js`, `assets/akatech-studio-logo.webp`.
- Réglage du décalage en escalier : variable `--off` des lignes `.mrow` dans `css/style.css`.
