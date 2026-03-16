import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// ─── Public (anon) client — used in browser ─────────────────────────────────
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl!, supabaseAnonKey!)
    : null;

// ─── Types matching our schema ───────────────────────────────────────────────

export interface DBProfile {
    id: string;
    name: string;
    initials: string;
    mobile: string | null;
    city: string | null;
    ssb_board: string | null;
    aspirant_type: string;
    role: "aspirant" | "admin";
    streak: number;
    last_active_date: string | null;
    created_at: string;
}

export interface DBTask {
    id: string;
    club_id: string;
    title: string;
    description: string;
    pts: number;
    date: string;
    active: boolean;
    requires_proof: boolean;
    created_at: string;
}

export interface DBVerification {
    id: string;
    task_id: string;
    user_id: string;
    proof_text: string | null;
    status: "pending" | "approved" | "rejected";
    reviewed_by: string | null;
    reviewed_at: string | null;
    review_note: string | null;
    submitted_at: string;
}

export interface DBCaptainAssignment {
    club_id: string;
    profile_id: string;
    assigned_at: string;
}
