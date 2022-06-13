# Tad's userscript and web extension boilerplate

**_This template is to be considered work in progress and not production ready!_**

## Development (with automatic reloading)

```sh
npm run dev
```

This bundles everything from `src/` into `dist/extension/` and `dist/userscript/script.user.js`. It will automatically update both the userscript and extension on source code changes.

### Userscript development

Install the development userscript from this URL: http://localhost:8124/server.user.js.

The `server.user.js` userscript is a wrapper which pulls the latest version of your script from `dist/userscript/script.user.js`.

### Extension development

Open the [Extensions Dashboard](chrome://extensions), make sure "Developer mode" is switched on, click "Load unpacked", and choose the `dist/extension` folder.

## Build for Production

```sh
npm run build
```

This will create a ZIP file with your package name and version in the `releases/extension` folder. It also bundles your userscript without sourcemapping to `releases/script.user.js`

## Usage

TBD

## Thanks

This Template is based on:

- https://github.com/extend-chrome/javascript-boilerplate
- https://github.com/cvzi/rollup-userscript-template
