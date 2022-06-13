import path from 'path';
import fs from 'fs-extra';

const localesDir = path.resolve('src/_locales');
const localesArr = fs.readdirSync(localesDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);
const appName = { default: '' };
const appDesc = { default: '' };
const messages = {};

localesArr.forEach((locale) => {
  const data = path.resolve(localesDir, locale, 'messages.json');
  const currentLocale = fs.readJSONSync(data);
  const { appName: { message: name }, appDesc: { message: desc } } = currentLocale;

  Object.entries(currentLocale).forEach(([key, value]) => {
    if (messages[key] === undefined) messages[key] = {};
    // messages[key] = messages[key] ?? {};
    messages[key][locale] = Object.values(value).toString();
  });

  if (locale === 'en') {
    appName.default = name;
    appDesc.default = desc;
  }
  appName[locale] = name;
  appDesc[locale] = desc;
});

// write everything in 'generatedMessages.json' file
fs.writeFileSync(path.join(localesDir, 'generatedMessages.json'), JSON.stringify(messages));

export { appName, appDesc };
