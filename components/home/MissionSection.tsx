import { BookOpen, DollarSign, Facebook, Send, Play } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const highlights = [
  { icon: BookOpen, textAm: "መጽሐፍ ቅዱስ ተኮር", textEn: "Bible Centered" },
  { icon: DollarSign, textAm: "100 % ነጻ", textEn: "100% Free" },
];

const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/share/14YKJYW1S17/", icon: Facebook, bg: "bg-[#1877F2] hover:bg-[#1466D9]" },
  { name: "Telegram", href: "https://t.me/btsuan_nen", icon: Send, bg: "bg-[#26A5E4] hover:bg-[#1E96D1]" },
  { name: "YouTube", href: "https://youtube.com/@henoktesfaye0?si=OdXHy3LnvtKs1DKT", icon: Play, bg: "bg-[#FF0000] hover:bg-[#E60000]" },
];

export default function MissionSection() {
  const { language } = useLanguage();

  return (
    <section className="py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Heading */}
          <p className="text-[11px] font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-[0.2em] mb-2">
            {language === "am" ? "ዓላማችን" : "Our Mission"}
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-8 leading-snug">
            {language === "am" ? "የእግዚአብሔርን በጎነት ለሁሉም መናገር" : "To declare the goodness of God to all"}
          </h2>

          {/* Scripture card */}
          <div className="relative rounded-2xl border border-border bg-card p-5 sm:p-7 mb-8">
            <div className="absolute top-4 left-5 text-4xl leading-none text-navy-200 dark:text-navy-800 font-serif select-none">&ldquo;</div>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground italic pt-4 px-2">
              {language === "am" ? (
                <>እናንተ ግን ከጨለማ ወደሚደነቅ ብርሃኑ የጠራችሁን የእርሱን በጎነት እንድትናገሩ የተመረጠ ትውልድ፥ የንጉሥ ካህናት፥ ቅዱስ ሕዝብ፥ ለርስቱ የተለየ ወገን ናችሁ፤</>
              ) : (
                <>But you are a chosen people, a royal priesthood, a holy nation, God&apos;s special possession, that you may declare the praises of him who called you out of darkness into his wonderful light.</>
              )}
            </p>
            <p className="mt-3 text-sm font-bold text-navy-500 dark:text-navy-400">
              {language === "am" ? "1ኛ ጴጥ 2፥9" : "1 Peter 2:9"}
            </p>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-800 bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 text-sm font-semibold"
              >
                <h.icon className="w-4 h-4 text-navy-500 dark:text-navy-400" />
                {language === "am" ? h.textAm : h.textEn}
              </div>
            ))}
          </div>

          {/* Social */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {language === "am" ? "ቤቱን ይጎብኙ" : "Follow Us"}
          </p>
          <div className="flex justify-center gap-2.5">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 ${link.bg}`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
