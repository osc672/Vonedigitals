import fs from 'fs';

const audioBase64 = fs.readFileSync('telugu_coaching_intro.mp3').toString('base64');

const template = `const AUDIO_B64 = "${audioBase64}";

function b64ToUint8(str: string): Uint8Array {
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export default async function(req: Request) {
  const url = new URL(req.url);

  if (url.pathname === "/audio" || url.pathname.endsWith("/audio.mp3")) {
    const bytes = b64ToUint8(AUDIO_B64);
    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": bytes.length.toString(),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400"
      }
    });
  }

  const plivoXml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>https://ia7mrz92.function2.insforge.app/vobiz-voice-webhook/audio</Play>
  <Wait length="15"/>
</Response>\`;

  return new Response(plivoXml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
`;

fs.writeFileSync('vobiz_webhook.ts', template);
console.log('Successfully wrote vobiz_webhook.ts!');
