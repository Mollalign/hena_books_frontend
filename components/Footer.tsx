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
      <div className="container mx-auto px-4 py-8">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-6">
          <Image src="/logo.jpeg" alt="ብፅዕና" width={32} height={32} className="rounded-full" />
          <span className="text-base font-bold">{language === "am" ? "ብፅዕና መጽሐፍት" : "ብፅዕና መጽሐፍት"}</span>
        </div>

        <p className="text-white/40 text-xs leading-relaxed mb-6 max-w-xs">
          {language === "am"
            ? "ለመጽሐፍ ቅዱስ ታማኝ ሆኖ የእግዚአብሔርን በጎነት ለሁሉም መናገር ።"
            : "Faithful to the Bible, declaring the goodness of God to all."}
        </p>

        {/* Links & Contact in two columns */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <h4 className="font-semibold text-xs mb-3">{language === "am" ? "ፈጣን አገናኞች" : "Quick Links"}</h4>
            <ul className="space-y-2">
              <li><Link href="/books" className="text-white/50 hover:text-white text-xs transition-colors">{language === "am" ? "መጽሐፍት" : "Books"}</Link></li>
              <li><Link href="#about" className="text-white/50 hover:text-white text-xs transition-colors">{language === "am" ? "ስለ ጸሐፊው" : "About Author"}</Link></li>
              {socialLinks.map((l) => (
                <li key={l.name}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white text-xs transition-colors">
                    {l.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs mb-3">{language === "am" ? "ግንኙነት" : "Contact"}</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:henoktesfaye199@gmail.com" className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs transition-colors">
                  <Mail className="w-3 h-3 shrink-0" /> henoktesfaye199@gmail.com
                </a>
              </li>
              <li>
                <a href="https://t.me/henoktesfaye1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs transition-colors">
                  <Send className="w-3 h-3 shrink-0" /> @henoktesfaye1
                </a>
              </li>
              <li>
                <a href="tel:+251942499172" className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs transition-colors">
                  <Phone className="w-3 h-3 shrink-0" /> 0942499172
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-3">
          <p className="flex items-center justify-center gap-1 text-[10px] text-white/30">
            &copy; {new Date().getFullYear()} {language === "am" ? "ብፅዕና መጽሐፍት ።" : "ብፅዕና መጽሐፍት"} Made with <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400" /> for the glory of God.
          </p>
        </div>
      </div>
    </footer>
  );
}
