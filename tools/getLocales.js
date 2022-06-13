import path from 'path';
import fs from 'fs-extra';

const localesDir = path.resolve('src/_locales');
const localesArr = fs.readdirSync(localesDir);
const appName = { default: '' };
const appDesc = { default: '' };
const messages = {};

localesArr.forEach((locale) => {
  const data = path.resolve(localesDir, locale, 'messages.json');
  const currentLocale = fs.readJSONSync(data);

  Object.entries(currentLocale).forEach(([key, value]) => {
    if (key === 'appName' || key === 'appDesc') return delete messages[key];
    if (messages[key] === undefined) messages[key] = {};
    messages[key][locale] = Object.values(value).toString();
  });

  // Used for Userscript Metablock:
  const { appName: { message: name }, appDesc: { message: desc } } = currentLocale;
  if (locale === 'en') {
    appName.default = name;
    appDesc.default = desc;
  }
  appName[locale] = name;
  appDesc[locale] = desc;
});

export { appName, appDesc, messages };
