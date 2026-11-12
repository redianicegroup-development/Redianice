# V32 → V33 : menu des pages intérieures aligné sur celui de la page d'accueil

## Problème (capture 07:08 vs 07:13)
- Sur toutes les pages autres que l'accueil, le menu plein écran (téléphone) montrait la langue sous forme de petits boutons bruts « FR EN AR ZH PT » et un simple lien e-mail, au lieu du sélecteur arrondi « Français ▾ » et des icônes rondes de l'accueil.
- Les liens réseaux du menu n'étaient pas à jour : le pied de page a 5 liens (Gmail, WhatsApp, LinkedIn, Instagram, TikTok), le menu de l'accueil n'en avait que 3, et celui des autres pages seulement l'e-mail (la page portfolio avait même un lien Facebook provisoire « PAGE-REDIANICE »).

## Ce qui change (11 pages)
- **Langue** : même sélecteur stylé que sur l'accueil (`#langSel`, bordure bleue arrondie, flèche) dans le menu de toutes les pages. Il utilise le code existant de `js/main.js` : aucun JS ni CSS ajouté.
- **Réseaux** : 5 icônes rondes dans le menu, dans le même ordre et avec les mêmes liens que le pied de page : Gmail, WhatsApp, LinkedIn, Instagram, TikTok. Le lien Facebook provisoire du portfolio disparaît du menu.
- Le sélecteur du portfolio ne propose plus que les 5 langues gérées par le site (FR, EN, AR, ZH, PT), comme partout ailleurs.

## Pages touchées
`index.html`, `404.html`, `confidentialite/`, `mentions-legales/`, `investir/`, `produits/e-carnet/`, `portfolio/e-carnet/`, `equipe/chef-de-projet/`, `equipe/graphiste-1/`, `equipe/graphiste-2/`, `equipe/mbollo-aka-elvis/`.

## Pour modifier plus tard
Les liens du menu et ceux du pied de page sont écrits dans chaque page : si un réseau change, il faut le changer aux deux endroits.
