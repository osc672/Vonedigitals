import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || 'https://ia7mrz92.us-east.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || 'anon_04d6af5944f71d7ba55f69ba85f975ccb0300856967f0458fee9b701b78516a4';

export const insforge = createClient({
  baseUrl,
  anonKey,
});

export default insforge;
