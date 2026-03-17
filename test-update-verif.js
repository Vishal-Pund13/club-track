require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: verifs } = await supabase.from('task_verifications').select('*');
  console.log("Found:", verifs?.length);
  if (!verifs || !verifs.length) return;

  const target = verifs[0];
  console.log("Attempting to update:", target.id);
  const { data, error } = await supabase.from('task_verifications').update({ status: 'approved' }).eq('id', target.id).select();
  console.log("Error:", error);
  console.log("Updated data:", data);
}
run();
