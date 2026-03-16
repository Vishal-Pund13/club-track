"use client";

import { useApp } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_PATHS = ["/", "/login", "/enlist"];

export default function ClientRoot({ children }: { children: React.ReactNode }) {
    const { state } = useApp();
    const { user, isGuest } = useAuth();
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
        if (!isPublic && !user && !isGuest) {
            router.push("/");
        }
        // Admin guard — non-admins trying to access /admin
        if (pathname === "/admin" && user?.role !== "admin") {
            router.push("/ops");
        }
    }, [pathname, user, isGuest, router]);

    return <>{children}</>;
}
