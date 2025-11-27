
import { createClient } from '@supabase/supabase-js';

// Credenciales proporcionadas por el usuario
const SUPABASE_URL = 'https://ejwzcgejtyvapsnlidik.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_N3SFHmA8YimnviTwifxa_A_H4CNT1fX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
