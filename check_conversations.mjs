import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: 'https://ia7mrz92.us-east.insforge.app',
  anonKey: 'anon_04d6af5944f71d7ba55f69ba85f975ccb0300856967f0458fee9b701b78516a4'
});

async function main() {
  const p = await client.database.from('profiles').select('*');
  console.log('PROFILES:', p.data ? p.data.map(x => ({ id: x.id, email: x.email, role: x.role })) : p.error);

  const e = await client.database.from('employees').select('*');
  console.log('EMPLOYEES:', e.data ? e.data.map(x => ({ id: x.id, name: x.name, user_id: x.user_id })) : e.error);

  const c = await client.database.from('conversations').select('*');
  console.log('CONVERSATIONS:', c.data ? c.data.map(x => ({ id: x.id, contact: x.contact_phone, outcome: x.outcome, duration: x.duration_seconds })) : c.error);
}

main();
