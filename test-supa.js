require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectDB() {
    console.log("=== PROFILES ===");
    const { data: profiles, error: err1 } = await supabase.from('profiles').select('*');
    if (err1) console.error(err1);
    console.log(profiles);

    console.log("\n=== TASKS ===");
    const { data: tasks, error: err2 } = await supabase.from('tasks').select('*');
    if (err2) console.error(err2);
    console.log(tasks);

    console.log("\n=== TASK VERIFICATIONS ===");
    const { data: verifs, error: err3 } = await supabase.from('task_verifications').select('*');
    if (err3) console.error(err3);
    console.log(verifs);
}
inspectDB();
