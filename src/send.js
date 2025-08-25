const {appendFile} = require('fs/promises');

const regulator = {
  'lastSentTime': 0,
  'cooldown': 20*1000,
  'cache': [],
  'batch': null,
};

async function sendToUrl(data) {
  // Save
  await appendFile('./save', [Date.now(), ...data].join(',')+'\n');
  if (process.env.APPS_SCRIPT_ENDPOINT_URL) {
    const condition = regulator.lastSentTime + regulator.cooldown;
    if (process.env.NO_CACHE === '1' || condition < Date.now()) {
      const send = await fetch(process.env.APPS_SCRIPT_ENDPOINT_URL, {
        method: 'POST',
        body: JSON.stringify({
          type: 'V2',
          data,
        }),
        redirect: 'follow',
      }).then((r)=>r.status);
      regulator.lastSentTime = Date.now();
      if (send !== 200) return false;
      return true;
    } else {
      regulator.cache.push(data);
      if (regulator.batch) return true;
      // Allow 3 seconds
      const timeout = regulator.cooldown + regulator.lastSentTime - Date.now() - 3000;
      console.log(timeout);
      regulator.batch = setTimeout(batchSend, timeout);
      return true;
    }
  } else console.warn('[WARNING] No Endpoint to send data!');
  return true;
}

async function batchSend() {
  // TBD : send as many from cache. reset batch to null;
  console.log('batch sendn');
  const package = [];
  while (regulator.cache.length > 0) {
    package.push(regulator.cache.shift());
  }
  const send = await fetch(process.env.APPS_SCRIPT_ENDPOINT_URL, {
    method: 'POST',
    body: JSON.stringify({
      type: 'V2',
      batch: true,
      data: package,
    }),
    redirect: 'follow',
  }).then((r)=>r.status);
  regulator.lastSentTime = Date.now();
  if (send !== 200) return false;
  regulator.batch = null;
  return true;
}

module.exports = {sendToUrl};
