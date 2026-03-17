import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AI Placement Platform",
  description: "AI-powered university placement management system",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={syne.variable}>
      <body>
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#16162a",
              border: "1px solid #2a2a45",
              color: "#f1f5f9",
            },
          }}
        />
      </body>
    </html>
  );
}
