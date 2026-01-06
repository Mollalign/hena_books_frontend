import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Hena Books - Discover Amazing Stories",
  description: "A platform to explore and read books by Henok. Dive into captivating stories and discover new perspectives.",
  keywords: ["books", "reading", "stories", "author", "Henok"],
  authors: [{ name: "Henok" }],
  openGraph: {
    title: "Hena Books - Discover Amazing Stories",
    description: "A platform to explore and read books by Henok",
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
        {children}
      </body>
    </html>
  );
}
