"use client";

import { useApp } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_PATHS = ["/", "/login", "/enlist"];

export default function ClientRoot({ children }: { children: React.ReactNode }) {
    const { state } = useApp();
    const { user, isGuest, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    // Dark mode
    useEffect(() => {
        if (state.darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [state.darkMode]);

    // Auth guard — redirect unauthenticated non-guests away from protected routes
    useEffect(() => {
        const isPublic = PUBLIC_PATHS.includes(pathname);
        console.log(`[Gate] Path: ${pathname}, User: ${user?.name || "None"}, Loading: ${loading}, isGuest: ${isGuest}`);

        if (loading) return; // Command Center check: Wait for auth to initialize

        if (!isPublic && !user && !isGuest) {
            console.log("[Gate] No credentials found. Pushing to home.");
            router.push("/");
            return;
        }

        // Admin guard — non-admins trying to access /admin
        if (pathname.startsWith("/admin") && user?.role !== "admin") {
            console.log("[Gate] Admin restricted area. User role:", user?.role);
            router.push("/ops");
        }
    }, [pathname, user, isGuest, loading, router]);

    // Show nothing or a tactical loader while checking credentials
    if (loading && !PUBLIC_PATHS.includes(pathname)) {
        return (
            <div style={{ minHeight: "100vh", background: "#0c0e0a", display: "flex", alignItems: "center", justifyContent: "center", color: "#4E5F3B", fontFamily: "'JetBrains Mono', monospace" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: 40, height: 40, border: "2px solid rgba(78,95,59,0.2)", borderTopColor: "#4E5F3B", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <span style={{ fontSize: "0.7rem", letterSpacing: "0.2em" }}>AUTHENTICATING COMMANDER...</span>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return <>{children}</>;
}
