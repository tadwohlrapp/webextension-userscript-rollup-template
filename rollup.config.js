import autoprefixer from 'autoprefixer';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import virtual from '@rollup/plugin-virtual';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import metablock from 'rollup-plugin-userscript-metablock';
import zip from 'rollup-plugin-zip';
import styles from 'rollup-plugin-styles';
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension';
import pkg from './package.json';
import { matches } from './src/config';
import { appName, appDesc, messages } from './tools/getLocales';

const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const isRelease = env === 'production';
const { production: dirProd, development: dirDev } = pkg.config.directories;

// CSS injector code and Options for 'rollup-plugin-styles'
const addStyleFunc = (css) => `
const style = document.createElement('style');
style.innerHTML = ${css};
document.head.appendChild(style);`;
const styleOptions = {
  mode: ['inject', (cssCode) => (`${addStyleFunc(cssCode)}`)],
  sourceMap: !isRelease,
  minimize: isRelease,
  plugins: [autoprefixer()],
};

// Options for 'rollup-plugin-chrome-extension'
const ceOptions = (mv) => ({
  extendManifest: (m) => {
    const manifest = m;
    manifest.manifest_version = mv;
    manifest.content_scripts[0].matches = matches.extension;
    return manifest;
  },
});

// Options for '@rollup/plugin-replace'
const replaceOptions = (type) => ({
  'process.env.NODE_ENV': JSON.stringify(env),
  ENVIRONMENT: JSON.stringify(env),
  __type__: () => JSON.stringify(type),
  preventAssignment: true,
});

// Options for '@rollup/plugin-virtual'
const virtualOptions = {
  translations: `export default ${JSON.stringify(messages)}`,
};

// Settings for userscript
const userscript = {
  input: 'src/index.js',
  output: {
    file: `${isRelease ? dirProd : dirDev}/userscript/script.user.js`,
    format: 'iife',
    sourcemap: !isRelease,
  },
  plugins: [
    metablock({
      file: 'src/metablock.json',
      override: {
        name: appName,
        description: appDesc,
        version: pkg.version,
        namespace: pkg.author.url,
        author: pkg.author.name,
        license: pkg.license,
        homepageURL: pkg.homepage,
        supportURL: pkg.bugs.url,
        icon: `${pkg.homepage}/raw/${pkg.config.branchName}/${pkg.config.directories.production}/userscript/img/icon-128.png`,
        match: matches.userscript,
      },
      order: [
        'name',
        'description',
        'version',
        'namespace',
        'author',
        'license',
        'homepageURL',
        'supportURL',
        'updateURL',
        'downloadURL',
        'icon',
        '...',
        'grant',
      ],
    }),
    styles(styleOptions),
    replace(replaceOptions('userscript')),
    json(),
    copy({
      targets: [
        { src: 'src/img/**/*', dest: `${isRelease ? dirProd : dirDev}/userscript/img` },
      ],
    }),
    virtual(virtualOptions),
    !isRelease && del({
      targets: `${dirDev}/userscript/img/*`,
      runOnce: true,
    }),
    isRelease && del({
      targets: `${dirProd}/userscript/img/*`,
    }),
  ],
};

// Settings shared by MV2 and MV3 extension
const extension = (mv) => ({
  input: ['src/manifest.json'],
  output: {
    dir: `${dirDev}/extensionmv${mv}`,
    format: 'esm',
  },
  plugins: [
    chromeExtension(ceOptions(mv)),
    simpleReloader(),
    styles(styleOptions),
    replace(replaceOptions('extension')),
    json(),
    virtual(virtualOptions),
    del({
      targets: `${dirDev}/extensionmv${mv}/*`,
    }),
    isRelease && zip({ dir: `${dirProd}/extensionmv${mv}` }),
  ],
});

// Settings for MV2 extension
const extensionMv2 = {
  input: extension(2).input,
  output: extension(2).output,
  plugins: extension(2).plugins,
};

// Settings for MV3 extension
const extensionMv3 = {
  input: extension(3).input,
  output: extension(3).output,
  plugins: extension(3).plugins,
};

export default [userscript, extensionMv2, extensionMv3];
