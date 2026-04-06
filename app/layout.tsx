import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/context/QueryProvider";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ብፅዕና መጽሐፍት - የእግዚአብሔርን በጎነት ለሁሉም መናገር",
  description:
    "የብፁዕ ሄኖክ ተስፋዬ የጽሑፍ ሥራ ። ለመጽሐፍ ቅዱስ ታማኝ ሆኖ የእግዚአብሔርን በጎነት ለሁሉም መናገር ይፈልጋል ።",
  keywords: [
    "ብፅዕና",
    "መጽሐፍት",
    "መጽሐፍ ቅዱስ",
    "ሄኖክ ተስፋዬ",
    "Christian books",
    "Ethiopian Christian",
  ],
  authors: [{ name: "ሄኖክ ተስፋዬ ደቸሬ" }],
  openGraph: {
    title: "ብፅዕና መጽሐፍት - የእግዚአብሔርን በጎነት ለሁሉም መናገር",
    description:
      "የብፁዕ ሄኖክ ተስፋዬ የጽሑፍ ሥራ ። ለመጽሐፍ ቅዱስ ታማኝ ሆኖ የእግዚአብሔርን በጎነት ለሁሉም መናገር ።",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="am" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Noto+Sans+Ethiopic:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-center" richColors />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
