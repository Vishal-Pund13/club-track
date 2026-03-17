require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testAdminApprove() {
    // 1. Get a pending verification
    const { data: verifs } = await supabase.from('task_verifications').select('*').eq('status', 'pending');
    if (!verifs || !verifs.length) {
        console.log("No pending verifications to approve. Let me insert one first...");
        const { data: users } = await supabase.from('profiles').select('id').limit(1);
        const { data: tasks } = await supabase.from('tasks').select('id').limit(1);
        if(!users.length || !tasks.length) return console.log("Missing users/tasks");
        
        await supabase.from('task_verifications').insert({
            task_id: tasks[0].id,
            user_id: users[0].id,
            proof_text: 'test proof',
            status: 'pending'
        });
        
        return testAdminApprove(); // retry after insert
    }

    const v = verifs[0];
    console.log("Found pending verification:", v.id);

    // 2. Try to update it using exactly the same fields as store.tsx
    const payload = {
        status: 'approved',
        review_note: 'Tested from script',
        reviewed_by: v.user_id, // we cheat and use same user as reviewer
        reviewed_at: new Date().toISOString(),
    };
    
    console.log("Supabase payload:", payload);

    const { data, error } = await supabase
        .from('task_verifications')
        .update(payload)
        .eq('id', v.id)
        .select()
        .single();
        
    if (error) {
        console.error("FAILED TO UPDATE:", error);
    } else if (!data) {
        console.log("Zero rows updated (RLS block or missing)");
    } else {
        console.log("SUCCESS, data:", data);
    }
}
testAdminApprove();
