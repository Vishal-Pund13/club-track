require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testAdminCreate() {
    console.log("Attempting to create admin...");
    const { data: suData, error: suError } = await supabase.auth.signUp({
        email: 'admin2@clubtrack.app',
        password: 'admin@ct2025',
        options: {
            data: { role: 'admin', name: 'Command Headquarters', mobile: 'admin2', initials: 'HQ' }
        }
    });

    console.log("SignUp Error:", suError);
    if (suData.user) {
        console.log("SignUp Success! User:", suData.user.id);
        const { data: profile, error: pError } = await supabase.from('profiles').select('*').eq('id', suData.user.id);
        console.log("Profile:", profile);
    }
}
testAdminCreate();
