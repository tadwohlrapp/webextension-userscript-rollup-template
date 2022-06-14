// Used for interpolating variables in the translations
// Credit: https://github.com/kohanyirobert/tplobj
export default function tplobj(tpl, obj) {
  let str = JSON.stringify(tpl);
  for (const key of Object.keys(obj)) {
    let arg = JSON.stringify(obj[key]);
    arg = arg.slice(1, arg.length - 1);
    str = str.split(`\${${key}}`).join(arg);
  }
  return JSON.parse(str);
}
