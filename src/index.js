import translations from 'translations'; // eslint-disable-line import/no-unresolved
import './scss/style.scss';
import tplobj from './utils/tplobj';

import headline from './js/getHeadline';

const container = document.createElement('section');
const newHeadline = document.createElement('h2');
const paragraph = document.createElement('p');

const translationVariables = {
  type: __type__,
};

const message = tplobj(translations, translationVariables);

newHeadline.textContent = __type__;

if (__type__ === 'userscript') {
  paragraph.textContent = `${message.sampleString.en} Userscript works!`;
}

if (__type__ === 'extension') {
  paragraph.textContent = `${message.sampleString.en} WebExtension works!`;
}

container.appendChild(newHeadline);
container.appendChild(paragraph);

headline.insertAdjacentElement('afterend', container);
