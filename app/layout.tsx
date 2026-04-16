import type { Metadata, Viewport } from "next";
import { Geist_Mono, Plus_Jakarta_Sans, Outfit, Noto_Sans_Ethiopic } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/context/QueryProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";
import "./pdf-viewer.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-noto-ethiopic",
  subsets: ["ethiopic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
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
      <body className={`${geistMono.variable} ${plusJakartaSans.variable} ${outfit.variable} ${notoSansEthiopic.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <QueryProvider>
            <AuthProvider>
              <LanguageProvider>
                {children}
                <Toaster position="top-center" richColors />
              </LanguageProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
