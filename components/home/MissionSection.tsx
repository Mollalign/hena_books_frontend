import Link from "next/link";
import { BookOpen, DollarSign } from "lucide-react";

const highlights = [
  { icon: BookOpen, text: "መጽሐፍ ቅዱስ ተኮር" },
  { icon: DollarSign, text: "100 % ነጻ" },
];

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/14YKJYW1S17/",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    name: "Telegram",
    href: "https://t.me/btsuan_nen",
    color: "bg-sky-500 hover:bg-sky-600",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@henoktesfaye0?si=OdXHy3LnvtKs1DKT",
    color: "bg-red-600 hover:bg-red-700",
  },
];

export default function MissionSection() {
  return (
    <section className="py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            ዓላማችን
          </h2>
          <p className="text-lg sm:text-xl font-semibold mb-6 text-foreground/80">
            የእግዚአብሔርን በጎነት ለሁሉም መናገር ነው ።
          </p>

          <blockquote className="relative p-6 rounded-2xl bg-muted/40 border border-border mb-8">
            <p className="text-sm sm:text-base leading-relaxed text-foreground/70 italic">
              &ldquo;እናንተ ግን ከጨለማ ወደሚደነቅ ብርሃኑ የጠራችሁን የእርሱን በጎነት እንድትናገሩ
              የተመረጠ ትውልድ፥ የንጉሥ ካህናት፥ ቅዱስ ሕዝብ፥ ለርስቱ የተለየ ወገን ናችሁ፤&rdquo;
            </p>
            <cite className="block mt-3 text-sm font-semibold text-navy-500 dark:text-navy-400 not-italic">
              1ኛ ጴጥ 2፥9
            </cite>
          </blockquote>



          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {highlights.map((h) => (
              <div
                key={h.text}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-gradient text-white text-sm font-semibold shadow"
              >
                <h.icon className="w-4 h-4" />
                {h.text}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold mb-4 text-foreground/60">
              ቤቱን ይጎብኙ
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow transition-all active:scale-95 ${link.color}`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
