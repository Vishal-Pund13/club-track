import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import ClientRoot from "@/components/ClientRoot";

export const metadata: Metadata = {
  title: "ClubTrack — SSB Mission Headquarters",
  description:
    "Track daily missions, earn intel points, and rise through the ranks across your SSB prep squads.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <AppProvider>
            <ClientRoot>{children}</ClientRoot>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
