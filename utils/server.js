import { red, green, cyan, bold } from 'colorette';
import { appName, appDesc } from './getLocales';
import { matches } from '../src/config';

const path = require('path');
const fs = require('fs-extra');
const http = require('http');
const handler = require('serve-handler');
const rollup = require('rollup');
const loadConfigFile = require('rollup/dist/loadConfigFile');
const metablock = require('rollup-plugin-userscript-metablock');
const pkg = require('../package.json');
const meta = require('../src/metablock.json');

const { port } = pkg.config;
const destDir = `${pkg.config.directories.development}/userscript/`;
const devScriptInFile = 'server.user.js';
const hyperlink = (url, title) => `\u001B]8;;${url}\u0007${title || url}\u001B]8;;\u0007`;

console.log('👀 watch & serve 🤲\n###################\n');

fs.mkdirSync(destDir, { recursive: true });

// Start web server
const server = http.createServer((request, response) => handler(request, response, {
  public: destDir,
}));
server.listen(port, () => {
  console.log(`Running webserver at ${hyperlink(`http://localhost:${port}`)}`);
});

// Create the userscript for development 'userscript/server.user.js'
const devScriptOutFile = path.join(destDir, devScriptInFile);
console.log(cyan(`generate development userscript ${bold('package.json')}, ${bold('metablock.json')}, ${bold(devScriptInFile)} → ${bold(devScriptOutFile)}...`));
const devScriptContent = fs.readFileSync(`utils/${devScriptInFile}`, 'utf8').replace(/%PORT%/gm, port.toString());

const grants = 'grant' in meta ? meta.grant.filter((el) => el !== 'none') : [];
if (grants.indexOf('GM.xmlHttpRequest') === -1) {
  grants.push('GM.xmlHttpRequest');
}
if (grants.indexOf('GM.setValue') === -1) {
  grants.push('GM.setValue');
}
if (grants.indexOf('GM.getValue') === -1) {
  grants.push('GM.getValue');
}

const override = {
  name: appName,
  description: appDesc,
  version: pkg.version,
  namespace: pkg.author.url,
  author: pkg.author.name,
  license: pkg.license,
  homepageURL: pkg.homepage,
  supportURL: pkg.bugs.url,
  updateURL: `http://localhost:${port}/${devScriptInFile}`,
  downloadURL: `http://localhost:${port}/${devScriptInFile}`,
  icon: `http://localhost:${port}/img/icon-128.png`,
  match: matches.userscript,
  grant: grants,
  connect: 'localhost',
};
if ('connect' in meta) {
  override.connect = meta.connect;
  override.connect.push('localhost');
}
const devMetablock = metablock({
  file: 'src/metablock.json',
  override,
  order: [
    'name',
    'description',
    'version',
    'namespace',
    'author',
    'license',
    'homepageURL',
    'supportURL',
    '...',
    'grant',
  ],
});

const result = devMetablock.renderChunk(devScriptContent, null, { sourcemap: false });
const outContent = typeof result === 'string' ? result : result.code;
fs.writeFileSync(path.resolve(destDir, devScriptInFile), outContent);
console.log(green(`created ${bold(devScriptOutFile)}. Install userscript from this URL: `) + hyperlink(`http://localhost:${port}/${devScriptInFile}`));

loadConfigFile(path.resolve('rollup.config.js')).then(
  async ({ options }) => {
    const watcher = rollup.watch(options);

    watcher.on('event', (event) => {
      if (event.code === 'BUNDLE_START') {
        console.log(cyan(`bundles ${bold(event.input)} → ${bold(event.output.map((fullPath) => path.relative(path.resolve('./'), fullPath)).join(', '))}...`));
      } else if (event.code === 'BUNDLE_END') {
        console.log(green(`created ${bold(event.output.map((fullPath) => path.relative(path.resolve('./'), fullPath)).join(', '))} in ${event.duration}ms`));
      } else if (event.code === 'ERROR') {
        console.log(bold(red('⚠ Error')));
        console.log(event.error);
      }
      if ('result' in event && event.result) {
        event.result.close();
      }
    });

    // stop watching
    watcher.close();
  },
);
