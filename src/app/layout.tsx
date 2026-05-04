import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/hooks/useTheme";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "VoteRoom — Real-Time Planning Poker",
  description: "Fast, beautiful, real-time voting rooms for agile teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              backdropFilter: "blur(20px)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "var(--shadow-hover)",
            },
            success: {
              iconTheme: { primary: "var(--brand)", secondary: "white" },
            },
          }}
        />
      </body>
    </html>
  );
}
