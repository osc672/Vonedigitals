import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';

function vobizPlugin() {
  return {
    name: 'vobiz-carrier-gateway',
    configureServer(server) {
      server.middlewares.use('/api/call/vobiz', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const env = loadEnv('', process.cwd(), '');

            const authId = env.VOBIZ_AUTH_ID || 'MA_OX983488';
            const authToken = env.VOBIZ_AUTH_TOKEN || 'p2XXlrYcwcOiw0xaE66Qm9sNij7zP0mbNQIGI7TmUlUVdYNc7vjbquywAFEw7ysG';
            const fromNumber = (parsed.from || env.VOBIZ_FROM_NUMBER || '918065354620').replace(/[^0-9]/g, '');
            const toNumber = (parsed.to || '').replace(/[^0-9]/g, '');

            if (!toNumber) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Missing destination phone number.' }));
            }

            const postData = JSON.stringify({
              from: fromNumber,
              to: toNumber,
              answer_url: 'https://ia7mrz92.function2.insforge.app/vobiz-voice-webhook',
              answer_method: 'POST'
            });

            console.log(`[VoBiz Carrier] Dispatching call from ${fromNumber} to ${toNumber}`);

            const vobizReq = https.request({
              hostname: 'api.vobiz.ai',
              path: `/api/v1/Account/${authId}/Call/`,
              method: 'POST',
              headers: {
                'X-Auth-ID': authId,
                'X-Auth-Token': authToken,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
              }
            }, vobizRes => {
              let responseBody = '';
              vobizRes.on('data', d => responseBody += d);
              vobizRes.on('end', () => {
                res.statusCode = vobizRes.statusCode;
                res.setHeader('Content-Type', 'application/json');
                res.end(responseBody);
              });
            });

            vobizReq.on('error', err => {
              console.error('[VoBiz Carrier Error]', err.message);
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            });

              vobizReq.write(postData);
              vobizReq.end();
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });

        // VoBiz Authenticated Recording Stream / Download Proxy
        server.middlewares.use('/api/vobiz/recording', (req, res) => {
          try {
            const reqUrl = new URL(req.url, 'http://localhost');
            const targetUrl = reqUrl.searchParams.get('url');
            if (!targetUrl) {
              res.statusCode = 400;
              return res.end('Missing url parameter');
            }

            const env = loadEnv('', process.cwd(), '');
            const authId = env.VOBIZ_AUTH_ID || 'MA_OX983488';
            const authToken = env.VOBIZ_AUTH_TOKEN || 'p2XXlrYcwcOiw0xaE66Qm9sNij7zP0mbNQIGI7TmUlUVdYNc7vjbquywAFEw7ysG';

            const parsedTarget = new URL(targetUrl);
            const proxyReq = https.request({
              hostname: parsedTarget.hostname,
              path: parsedTarget.pathname + parsedTarget.search,
              method: 'GET',
              headers: {
                'X-Auth-ID': authId,
                'X-Auth-Token': authToken
              }
            }, proxyRes => {
              res.statusCode = proxyRes.statusCode;
              res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'audio/mpeg');
              res.setHeader('Accept-Ranges', 'bytes');
              if (proxyRes.headers['content-length']) {
                res.setHeader('Content-Length', proxyRes.headers['content-length']);
              }
              if (reqUrl.searchParams.get('download') === 'true') {
                res.setHeader('Content-Disposition', 'attachment; filename="call_recording.mp3"');
              }
              proxyRes.pipe(res);
            });

            proxyReq.on('error', err => {
              console.error('[VoBiz Recording Proxy Error]', err.message);
              if (!res.headersSent) {
                res.statusCode = 502;
                res.end('Failed to fetch recording');
              }
            });

            proxyReq.end();
          } catch (err) {
            res.statusCode = 500;
            res.end(err.message);
          }
        });

        // Cartesia Studio-Grade TTS Endpoint (streaming, low-latency)
        server.middlewares.use('/api/tts/cartesia', (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            return res.end(JSON.stringify({ error: 'Method not allowed' }));
          }

          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const env = loadEnv('', process.cwd(), '');
              const apiKey = env.CARTESIA_API_KEY || 'sk_car_ZZTo6efvKfQ8eZsAzVzhbc';
              const voiceId = parsed.voice_id || env.CARTESIA_VOICE_ID || '292708e4-1200-4214-a3b7-f522a88c7284';
              const text = parsed.text || '';
              const lang = parsed.language === 'English' ? 'en' : parsed.language === 'Hindi' ? 'hi' : parsed.language === 'Tamil' ? 'ta' : 'te';

              const postData = JSON.stringify({
                model_id: 'sonic-3',
                transcript: text,
                voice: { mode: 'id', id: voiceId },
                // Lower bit_rate = faster first-byte latency
                output_format: { container: 'mp3', sample_rate: 22050, encoding: 'mp3', bit_rate: 64000 },
                language: lang
              });

              const cReq = https.request({
                hostname: 'api.cartesia.ai',
                path: '/tts/bytes',
                method: 'POST',
                headers: {
                  'X-API-Key': apiKey,
                  'Cartesia-Version': '2024-06-10',
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(postData)
                }
              }, cRes => {
                // Stream audio directly — browser starts playing before full download
                res.statusCode = cRes.statusCode;
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('X-Accel-Buffering', 'no');
                cRes.pipe(res);
              });

              cReq.on('error', err => {
                console.error('[Cartesia Error]', err.message);
                if (!res.headersSent) {
                  res.statusCode = 502;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                }
              });

              cReq.write(postData);
              cReq.end();
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });
      }
    };
  }

export default defineConfig({
  plugins: [react(), vobizPlugin()],
  server: {
    port: 3000,
    open: false
  }
});
