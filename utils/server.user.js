'use strict';

(() => {
  const url = `http://localhost:%PORT%/script.user.js?${Date.now()}`;
  new Promise((resolve, reject) => {
    const req = GM.xmlHttpRequest({
      method: 'GET',
      url,
      onload(r) {
        if (r.status !== 200) {
          return reject(r);
        }
        resolve(r.responseText);
      },
      onerror: (e) => reject(e),
    });
    if (req && 'catch' in req) {
      req.catch((e) => { console.error(e); });
    }
  }).catch((e) => {
    const log = (obj, b) => {
      let prefix = 'loadBundleFromServer: ';
      try {
        prefix = `${GM.info.script.name}: `;
      } catch (err) { console.error(err); }
      if (b) {
        console.log(prefix + obj, b);
      } else {
        console.log(prefix, obj);
      }
    };
    if (e && 'status' in e) {
      if (e.status <= 0) {
        log('Server is not responding');
        GM.getValue('scriptlastsource3948218', false).then((src) => {
          if (src) {
            log('%cExecuting cached script version', 'color: Crimson; font-size:x-large;');
            eval(src);
          }
        });
      } else {
        log(`HTTP status: ${e.status}`);
      }
    } else {
      log(e);
    }
  }).then((s) => {
    if (s) {
      eval(`${s}
//# sourceURL=${url}`);
      GM.setValue('scriptlastsource3948218', s);
    }
  });
})();
