# Shacli (Shared Clipboard)

<div align="center">
    <a href="https://goldy98.github.io/shacli">
        <img src="https://goldy98.github.io/shacli/images/icon.png">
    </a>
</div>

<div align="center">

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](http://thismypc.com/)
[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/for-you.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/made-with-vue.svg)](https://forthebadge.com)
<br />

</div>

> Shacli provide a shared clipboard between two devices (everything copied on one device is available to download on the other devices)

> The source code is open so that you can download the source code and tweak as you want.

:star: Star me on GitHub — it helps!

## App Screenshots

|                                                 Desktop App Home                                                 |                                                 Desktop App Sharing View                                                 |                                          Web Client Page                                          |
| :--------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------: |
| <img src="https://goldy98.github.io/shacli/screenshots/desktop-app-1.png" title="Desktop App Home" width="100%"> | <img src="https://goldy98.github.io/shacli/screenshots/desktop-app-2.png" title="Desktop App Sharing page" width="100%"> | <img src="https://goldy98.github.io/shacli/screenshots/web-app.png" title="Web app" width="100%"> |

## Folder Structure

    .
    ├── dist_electron                # Electron dist folder (where build result goes)
    ├── shacli-client                # Client Web App source
    ├── screenshots                  # App Screenshots
    ├── public                       # Public assets directory
    ├────── client                   # Client web app
    ├────── icon.png                 # Desktop app icon
    ├── src                          # Source
    ├────── assets                   # Assets directory
    ├────── components               # Vue components
    ├────── helpers                  # Helpers
    ├────── router                   # Vue router config
    ├────── store                    # Vuex store
    ├────── views                    # Vue Views
    ├── .gitignore
    ├── LICENSE
    └── README.md

## Developing

### Platforms

| Platform          | Status     |
| ----------------- | ---------- |
| Microsoft Windows | Developing |
| Linux             | Developing |
| Mac os            | Pending    |

### Built With

- [Love 💕](#) - A lot of love (and coffee)
- [Vue JS](https://vuejs.org/) -The Progressive JavaScript Framework
- [Electron JS](https://www.electronjs.org/) - Build cross-platform desktop apps with JavaScript, HTML, and CSS
- [NodeJS](https://nodejs.org/) - Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine
- [Vue CLI Plugin Electron Builder](https://nklayman.github.io/vue-cli-plugin-electron-builder/) - Easily Build Your Vue.js App For Desktop With Electron

### Clone Project

```shell
git clone https://github.com/goldy98/shacli.git
```

## Project setup

### Create electron dist folder

```shell
cd shacli/
mkdir dist_electron
```

### Setting up client web app

```shell
cd shacli/shacli-client
npm install
```

`cd shacli/shacli-client` Move into client app Project Folder
`npm install` install all dependency.

#### Compiles and hot-reloads web client app for development

```
npm run serve
```

#### Build client web app

```shell
npm run build
```

Assuming you're already in `shacli-client` folder,
`npm run build` will build the client web app and copy build result to `shacli/public` directory.

### Setting up shacli desktop app

```shell
cd shacli
npm install
```

#### Compiles and hot-reloads shacli desktop app for development

```
npm run electron:serve
```

#### Generate icons

```
npm run electron:generate-icons
```

#### Compiles and minifies for production (Generate production ready .AppImage and .snap package for Linux)

```
npm run electron:build
```

#### Build .deb package for linux

```
npm run electron:build -- --linux deb
```

#### Build .nsis package for windows

```
npm run electron:build -- --win nsis
```

#### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## License

[MIT](https://choosealicense.com/licenses/mit/)
