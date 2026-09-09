import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// NOTE: This sandbox has no network access to Google Fonts, so we fall back
// to a system font stack via CSS variables (see globals.css). When you run
// this locally/on Vercel with network access, swap this block back to
// `next/font/google` imports for Space Grotesk / Inter / JetBrains Mono —
// instructions are in the README.

export const metadata: Metadata = {
  title: {
    default: "PGDevLabs — Independent developer studio",
    template: "%s | PGDevLabs",
  },
  description:
    "PGDevLabs is an independent developer studio building useful apps, thoughtful interfaces, and reliable digital products.",
  metadataBase: new URL("https://pgdevlabs.example.com"),
  openGraph: {
    title: "PGDevLabs — Independent developer studio",
    description: "Useful apps, thoughtful interfaces, and reliable digital products.",
    type: "website",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
