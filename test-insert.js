require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInsert() {
    const { data: users } = await supabase.from('profiles').select('id').limit(1);
    const { data: tasks } = await supabase.from('tasks').select('id').limit(1);
    
    if (!users.length || !tasks.length) {
        console.log("No users or tasks to test with.");
        return;
    }

    const { data, error } = await supabase.from('task_verifications').insert({
        task_id: tasks[0].id,
        user_id: users[0].id,
        proof_text: 'test proof from script',
        status: 'pending'
    }).select().single();

    console.log("Error:", error);
    console.log("Data:", data);
}
testInsert();
