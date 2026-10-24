const authId = 'MA_OX983488';
const authToken = 'p2XXlrYcwcOiw0xaE66Qm9sNij7zP0mbNQIGI7TmUlUVdYNc7vjbquywAFEw7ysG';

async function testVoBiz() {
  try {
    const res = await fetch(`https://api.vobiz.ai/api/v1/Account/${authId}/`, {
      method: 'GET',
      headers: {
        'X-Auth-ID': authId,
        'X-Auth-Token': authToken,
        'Content-Type': 'application/json'
      }
    });

    console.log('HTTP Status:', res.status, res.statusText);
    const body = await res.text();
    console.log('Response body:', body);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testVoBiz();
