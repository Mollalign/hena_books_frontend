"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Heart, Phone, Send } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/share/14YKJYW1S17/" },
  { name: "Telegram", href: "https://t.me/btsuan_nen" },
  { name: "YouTube", href: "https://youtube.com/@henoktesfaye0?si=OdXHy3LnvtKs1DKT" },
];

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-navy-950 dark:bg-[#0a0f1a] text-white">
      <div className="container mx-auto px-5 py-10 sm:px-6 sm:py-12">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-4">
          <Image src="/logo.jpeg" alt="ብፅዕና" width={36} height={36} className="rounded-full" />
          <span className="text-lg font-bold">{language === "am" ? "ብፅዕና" : "ብፅዕና"}</span>
        </div>

        <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm">
          {language === "am"
            ? "ለመጽሐፍ ቅዱስ ታማኝ ሆኖ የእግዚአብሔርን በጎነት ለሁሉም መናገር ።"
            : "Faithful to the Bible, declaring the goodness of God to all."}
        </p>

        {/* Links & Contact */}
        <div className="grid grid-cols-2 gap-8 sm:gap-12 mb-8">
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/80">
              {language === "am" ? "ፈጣን አገናኞች" : "Quick Links"}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/books" className="text-white/60 hover:text-white text-sm transition-colors">
                  {language === "am" ? "መጽሐፍት" : "Books"}
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-white/60 hover:text-white text-sm transition-colors">
                  {language === "am" ? "ስለ ጸሐፊው" : "About Author"}
                </Link>
              </li>
              {socialLinks.map((l) => (
                <li key={l.name}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white text-sm transition-colors">
                    {l.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/80">
              {language === "am" ? "ግንኙነት" : "Contact"}
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:henoktesfaye199@gmail.com" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors break-all">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>henoktesfaye199@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="https://t.me/henoktesfaye1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
                  <Send className="w-4 h-4 shrink-0" />
                  <span>@henoktesfaye1</span>
                </a>
              </li>
              <li>
                <a href="tel:+251942499172" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>0942499172</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-5 py-4 sm:px-6">
          <p className="flex items-center justify-center gap-1 text-xs text-white/40">
            &copy; {new Date().getFullYear()} {"ብፅዕና።"} Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for the glory of God.
          </p>
        </div>
      </div>
    </footer>
  );
}
