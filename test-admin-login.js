require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testAdminLogin2() {
    console.log("Attempting to login admin2...");
    const { data, error } = await supabase.auth.signInWithPassword({ 
        email: 'admin2@clubtrack.app', 
        password: 'admin@ct2025' 
    });
    
    if (error) {
        console.error("Login Failed:", error.message);
    } else {
        console.log("Login Success! User:", data.user.id);
    }
}
testAdminLogin2();
