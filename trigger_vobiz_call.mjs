import https from 'node:https';

const authId = process.env.VOBIZ_AUTH_ID || 'MA_OX983488';
const authToken = process.env.VOBIZ_AUTH_TOKEN || 'p2XXlrYcwcOiw0xaE66Qm9sNij7zP0mbNQIGI7TmUlUVdYNc7vjbquywAFEw7ysG';
const targetNumber = '916281604742';
const fromNumber = process.env.VOBIZ_FROM_NUMBER || '916281604742';

const payload = JSON.stringify({
  from: fromNumber,
  to: targetNumber,
  answer_url: 'https://ia7mrz92.us-east.insforge.app/functions/v1/vobiz-voice-webhook',
  answer_method: 'POST'
});

console.log('Dispatching VoBiz Outbound Call:', {
  authId,
  from: fromNumber,
  to: targetNumber
});

const req = https.request({
  hostname: 'api.vobiz.ai',
  path: `/api/v1/Account/${authId}/Call/`,
  method: 'POST',
  headers: {
    'X-Auth-ID': authId,
    'X-Auth-Token': authToken,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    try {
      console.log('VoBiz Response:', JSON.parse(data));
    } catch {
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (err) => console.error('Request Error:', err.message));
req.write(payload);
req.end();
