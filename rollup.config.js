import autoprefixer from 'autoprefixer';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import metablock from 'rollup-plugin-userscript-metablock';
import zip from 'rollup-plugin-zip';
import styles from 'rollup-plugin-styles';
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension';
import pkg from './package.json';
import { appName, appDesc } from './tools/getLocales';

const env = process.env.NODE_ENV ?? 'development';
const isRelease = env === 'production';
const { production: dirProd, development: dirDev } = pkg.config.directories;

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

const replaceOptions = (type) => ({
  'process.env.NODE_ENV': JSON.stringify(env),
  ENVIRONMENT: JSON.stringify(env),
  __type__: () => JSON.stringify(type),
  preventAssignment: true,
});

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
        'icon64',
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
    !isRelease && del({
      targets: `${dirDev}/userscript/img/*`,
      runOnce: true,
    }),
    isRelease && del({
      targets: `${dirProd}/userscript/img/*`,
    }),
  ],
};

const extension = {
  input: ['src/manifest.json'],
  output: {
    dir: `${dirDev}/extension`,
    format: 'esm',
  },
  plugins: [
    chromeExtension({
      // browserPolyfill: true,
    }),
    simpleReloader(),
    styles(styleOptions),
    replace(replaceOptions('extension')),
    json(),
    del({
      targets: `${dirDev}/extension/*`,
    }),
    isRelease && zip({ dir: dirProd }),
  ],
};

export default [extension, userscript];
