import Image from "next/image";
import { Mail, Phone, Send } from "lucide-react";

const contacts = [
  {
    icon: Mail,
    label: "Email",
    value: "henoktesfaye199@gmail.com",
    href: "mailto:henoktesfaye199@gmail.com",
  },
  {
    icon: Send,
    label: "Telegram",
    value: "@henoktesfaye1",
    href: "https://t.me/henoktesfaye1",
  },
  {
    icon: Phone,
    label: "ስልክ",
    value: "0942499172 / 0716653386",
    href: "tel:+251942499172",
  },
];

export default function AboutSection() {
  return (
    <section className="py-10 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">ስለ ጸሐፊው</h2>

          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-3 border-navy-300 dark:border-navy-700 shadow-xl mx-auto mb-4">
            <Image
              src="/hena.jpg"
              alt="ሄኖክ ተስፋዬ ደቸሬ"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 112px, 144px"
            />
          </div>

          <h3 className="text-lg font-bold mb-1">ሄኖክ ተስፋዬ ደቸሬ</h3>
          <div className="space-y-1 text-sm text-foreground/60 mb-5">
            <p>በዲላ አማኑኤል ሕብረት ቤተክርስቲያን የወንጌል ሥርጭት አገልጋይ ።</p>
            <p>በአሁኑ ጊዜ የሐዋሳ ዩኒቨርስቲ ተማሪ ነው ።</p>
            <p>በሐዋሳ ዩኒቨርስቲ( HU-Fello ) Evang team ያገለግላል ።</p>
          </div>

          <div className="space-y-2">
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-background border border-border hover:border-navy-300 transition-all group"
              >
                <div className="w-8 h-8 rounded-md bg-navy-gradient flex items-center justify-center text-white shrink-0">
                  <c.icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[10px] text-muted-foreground leading-none mb-0.5">
                    {c.label}
                  </div>
                  <div className="text-xs font-semibold truncate">{c.value}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
