import translations from 'translations'; // eslint-disable-line import/no-unresolved
import './scss/style.scss';
import headline from './getHeadline';

const newHeadline = document.createElement('h2');

if (__type__ === 'userscript') newHeadline.textContent = 'Userscript';

if (__type__ === 'extension') newHeadline.textContent = 'WebExtension';

headline.insertAdjacentElement('afterend', newHeadline);

const localeString = document.createElement('p');

localeString.textContent = translations.sampleString.en;

newHeadline.insertAdjacentElement('afterend', localeString);
