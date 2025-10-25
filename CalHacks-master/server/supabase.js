const path = require('path');
// load server/.env explicitly so it works even if cwd is different
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('DEBUG: Loaded env file =>', path.join(__dirname, '.env'));

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('DEBUG: SUPABASE_URL=', supabaseUrl ? 'Loaded' : 'Missing');
console.log('DEBUG: SUPABASE_SERVICE_ROLE_KEY=', supabaseServiceKey ? 'Loaded' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Make sure server/.env has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = supabase;
