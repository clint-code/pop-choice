import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { OPENAI_API_KEY, SUPABASE_API_KEY, SUPABASE_URL } from './config-keys';

if (!OPENAI_API_KEY) throw new Error('OpenAI API key is missing or invalid.');
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

if (!SUPABASE_API_KEY) throw new Error('Expected env var VITE_SUPABASE_API_KEY');
if (!SUPABASE_URL) throw new Error('Expected env var VITE_SUPABASE_URL');
export const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
