import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hena Books - Biblical Resources for Spiritual Growth",
  description: "Discover biblical teachings, devotionals, and resources to deepen your walk with Christ. A ministry dedicated to making transformative Christian literature accessible to all.",
  keywords: ["Christian books", "biblical resources", "devotionals", "Bible study", "spiritual growth", "Protestant", "faith", "theology"],
  authors: [{ name: "Hena Books Ministry" }],
  openGraph: {
    title: "Hena Books - Biblical Resources for Spiritual Growth",
    description: "Discover biblical teachings, devotionals, and resources to deepen your walk with Christ.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
