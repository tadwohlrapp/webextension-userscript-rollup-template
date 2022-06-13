import './scss/style.scss';
import headline from './getHeadline';
import * as messages from './_locales/generatedMessages.json';

const newHeadline = document.createElement('h2');

if (__type__ === 'userscript') newHeadline.textContent = 'Userscript';

if (__type__ === 'extension') newHeadline.textContent = 'WebExtension';

headline.insertAdjacentElement('afterend', newHeadline);

const localeString = document.createElement('p');

localeString.textContent = messages.sampleString.en;

newHeadline.insertAdjacentElement('afterend', localeString);
