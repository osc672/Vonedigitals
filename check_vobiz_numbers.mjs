import https from 'node:https';

const authId = 'MA_OX983488';
const authToken = 'p2XXlrYcwcOiw0xaE66Qm9sNij7zP0mbNQIGI7TmUlUVdYNc7vjbquywAFEw7ysG';

function getVobiz(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.vobiz.ai',
      path,
      method: 'GET',
      headers: {
        'X-Auth-ID': authId,
        'X-Auth-Token': authToken,
        'Content-Type': 'application/json'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  for (const endpoint of [
    `/api/v1/Account/${authId}/Number/`,
    `/api/v1/Account/${authId}/PhoneNumber/`,
    `/api/v1/Account/${authId}/Numbers/`
  ]) {
    try {
      const res = await getVobiz(endpoint);
      console.log(endpoint, res.status, res.data.slice(0, 200));
    } catch (e) {
      console.log(endpoint, e.message);
    }
  }
}

run();
