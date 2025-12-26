
import { createClient } from '@supabase/supabase-js';

/**
 * КОНФИГУРАЦИЯ ПОДКЛЮЧЕНИЯ:
 * URL автоматически вычислен из вашего ключа (ref: rvvekdelrpwtbyjexrmh).
 */
const SUPABASE_URL: string = 'https://rvvekdelrpwtbyjexrmh.supabase.co';
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dmVrZGVscnB3dGJ5amV4cm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MDgyOTUsImV4cCI6MjA4MjI4NDI5NX0.-OpzCgFjw89tEWPOsWJifuw392YGgSFHyCpkuuAKadE';

// Проверка на заполнение ключей (уже настроено)
const isConfigured = SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const checkSupabaseConfig = () => {
  return isConfigured;
};
