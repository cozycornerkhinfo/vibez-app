import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ofxuiupsnvgnzammngeg.supabase.co',
  'sb_publishable__xvwHmMhflEjpPI2ct0Tqg_EtKrNJfv',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
