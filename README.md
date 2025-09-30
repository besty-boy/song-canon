# Song Canon

Application web statique (HTML/CSS/JavaScript) construite avec Webpack et déployée sur Vercel.

- Démo en ligne: https://song-canon.vercel.app
- Dépôt: https://github.com/besty-boy/song-canon

## Sommaire

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Pile technique](#pile-technique)
- [Prise en main](#prise-en-main)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
  - [Développement](#développement)
  - [Build de production](#build-de-production)
- [Structure du projet](#structure-du-projet)
- [Déploiement](#déploiement)
- [Contribution](#contribution)
- [Licence](#licence)

## Aperçu

Song Canon est une petite application front-end livrée sous forme de site statique. Le projet s’appuie sur Webpack pour le bundling et est configuré pour être déployé facilement sur Vercel.

## Fonctionnalités

- Site statique léger en HTML/CSS/JS.
- Configuration Webpack pour développement et production.
- Manifest web (`site.webmanifest`) et icônes (`icon.png`, `icon.svg`, `favicon.ico`).
- Page 404 dédiée (`404.html`).
- Déploiement simple sur Vercel (`vercel.json`).

## Pile technique

- HTML5, CSS3, JavaScript
- Webpack (configurations de dev et prod)
- Vercel (hébergement)

## Prise en main

### Prérequis

- Node.js et npm installés (version récente recommandée, par ex. Node 18+)

### Installation

```bash
git clone https://github.com/besty-boy/song-canon.git
cd song-canon
npm install
```

### Développement

Lancez le serveur de développement (consultez les scripts disponibles dans `package.json`) :

```bash
npm run dev
```

Le serveur lance généralement l’application en local (par défaut, souvent sur http://localhost:8080). Si besoin, référez-vous à la sortie du terminal pour l’URL exacte.

### Build de production

Générez les fichiers optimisés pour la production :

```bash
npm run build
```

Les fichiers de sortie sont généralement émis dans un répertoire de distribution (ex. `dist/`). Vérifiez/ajustez le chemin de sortie dans les fichiers de configuration Webpack si nécessaire.

## Structure du projet

Principaux éléments à la racine du dépôt:

- `index.html` — point d’entrée du site
- `css/` — styles
- `js/` — scripts
- `img/` — images et assets
- `webpack.common.js`, `webpack.config.dev.js`, `webpack.config.prod.js` — configurations Webpack
- `site.webmanifest` — manifeste web app
- `icon.png`, `icon.svg`, `favicon.ico` — icônes
- `404.html` — page 404 personnalisée
- `vercel.json` — configuration de déploiement Vercel
- `package.json`, `package-lock.json` — dépendances et scripts npm
- `.editorconfig`, `.gitattributes`, `.gitignore` — fichiers de configuration
- `LICENSE.txt` — licence

## Déploiement

Le projet est prêt pour Vercel :
- Connectez le dépôt à votre compte Vercel.
- Vercel détectera la configuration et construira le projet selon les scripts définis.
- Le fichier `vercel.json` peut ajuster le comportement du déploiement (routes, headers, etc.).

Vous pouvez aussi héberger la version buildée sur n’importe quel service de fichiers statiques.


## Licence

Ce projet est publié sous licence MIT. Voir le fichier [LICENSE.txt](LICENSE.txt) pour plus de détails.
