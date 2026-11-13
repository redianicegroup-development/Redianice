# V36 → V37 : mots clés entourés (effet 11), effets souris, textes équipe, pied de page mobile compact

Fusion sur la V36 (nouveau bleu `#3d5a8d`, menu plein écran, crédit AKATech conservés).

## Mots clés entourés (accueil et fiches équipe)
- Effet 11 « spirale ovale » de `svggg_prooo.html`, en bleu du site (`--blue`). Le trait se dessine, reste, s'efface, recommence tant que le mot est visible ; il repart à chaque fois que le mot revient à l'écran (déclenché au scroll, comme la démo).
- Balisage : `<strong class="hl">mot clé</strong>` (1 à 3 mots, jamais à la ligne). Le SVG est ajouté par `js/highlight.js`, recalculé aux dimensions réelles du mot (trait de largeur constante, recalcul au redimensionnement et au chargement de la police).
- Mots entourés : accueil : produits numériques, quatre personnes, solutions numériques, un besoin, acteur indépendant, vrai besoin, difficulté concrète, propres produits, Écrivez-nous. Fiches : Aka (plus de 10 clients, orienté produit), chef de projet (points de vigilance, cadre juridique), graphiste 1 (identité visuelle, en binôme), graphiste 2 (réseaux sociaux, plus visibles).
- Dans les textes qui s'allument au scroll, le mot clé s'allume d'un bloc avec les autres mots (`words()` de `js/main.js` adapté : une virgule collée au mot clé reste collée).
- « Réduire les animations » : le tracé reste dessiné, sans mouvement.
- Pour entourer un autre mot : l'envelopper dans `<strong class="hl">` dans le HTML, rien d'autre.

## Effets souris de `bon.html`, sur toutes les pages (`js/souris.js`)
- Curseur : point qui suit la souris avec de l'inertie, en `mix-blend-mode: difference` (il inverse les couleurs dessous : sombre sur le fond clair, jaune sur le bleu). Sur un lien, un bouton, une carte ou un objet du pied de page, il grossit en lentille de 46 px qui inverse le texte ; au clic il se resserre. Le curseur du système est masqué une fois la souris détectée, sauf dans les champs de texte et quand une capture est agrandie.
- Boutons magnétiques : pastilles, boutons, bouton « Menu », « Haut de page ».
- Cartes inclinables en 3D (6° max) : cartes produit, cartes équipe (écran large), puces des fiches.
- Parallaxe : texte du hero et objets 3D de l'accueil, portrait et texte des fiches, en sens inverse.
- Uniquement avec une vraie souris (hover + pointeur précis) et sans « réduire les animations » : téléphone et tablette tactile ne changent pas. Réglages en tête de `js/souris.js` (`MAG_PULL`, `TILT_MAX`, `PARA`, sélecteurs).
- Les décalages utilisent `translate` (boutons, parallaxe) et `transform` (inclinaison) : ils s'ajoutent aux survols existants.

## Textes et boutons
- Accueil : « Quatre profils complémentaires. » devient « L’équipe ».
- Fiches équipe : « Ce qu’il fait » retiré (graphiste 2). Les deux boutons « Lui écrire » et « Contact et liens » sont remplacés par un seul bouton « Contact » qui mène à la section des liens de contact (`#contact`), sur les 4 fiches.

## Pied de page sur téléphone / tablette (≤ 899 px)
- Plus compact : il n'est plus étiré à la hauteur de l'écran (la V31 reste telle quelle sur ordinateur). Environ 660 px au lieu de 715 à 915 px.
- Logo, slogan et icônes un peu plus bas par rapport au bord du haut, et posés juste au-dessus des objets (plus de grand vide entre les deux).
- Objets inchangés : mêmes positions (`SET_PHONE`), toujours déplaçables (`js/footer-fx.js` non modifié). Barre du bas resserrée (copyright, crédit AKATech, mentions, « Haut de page »).

## Fichiers
- Créés : `js/highlight.js`, `js/souris.js`.
- Modifiés : `css/style.css` (bloc V37 en fin de fichier), `js/main.js` (`words()` seulement), `index.html`, les 4 fiches `equipe/*` (textes, bouton, mots clés, scripts), les 6 autres pages (`js/souris.js` seulement), `README.md`.
