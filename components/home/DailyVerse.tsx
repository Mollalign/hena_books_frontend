import { BookOpen } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const DAILY_VERSES = [
  { text: "ሕግህ ለእግሬ መብራት፥ ለመንገዴም ብርሃን ነው።", reference: "መዝሙር 119:105" },
  { text: "የእግዚአብሔር ሰው ፍጹምና ለበጎ ሥራ ሁሉ የተዘጋጀ ይሆን ዘንድ፥ የእግዚአብሔር መንፈስ ያለበት መጽሐፍ ሁሉ ለትምህርትና ለተግሣጽ ልብንም ለማቅናት በጽድቅም ላለው ምክር ደግሞ ይጠቅማል።", reference: "2 ጢሞቴዎስ 3:16" },
  { text: "እንግዲህ እምነት ከመስማት ነው መስማትም በእግዚአብሔር ቃል ነው።", reference: "ሮሜ 10:17" },
  { text: "የእግዚአብሔር ቃል ሕያው ነውና፥ የሚሠራም፥ ሁለትም አፍ ካለው ሰይፍ ሁሉ ይልቅ የተሳለ ነው፤", reference: "ዕብራውያን 4:12" },
  { text: "ቃሉን የምታደርጉ ሁኑ እንጂ ራሳችሁን እያሳታችሁ የምትሰሙ ብቻ አትሁኑ።", reference: "ያዕቆብ 1:22" },
  { text: "ሰማይና ምድር ያልፋሉ፥ ቃሌ ግን አያልፍም።", reference: "ማቴዎስ 24:35" },
  { text: "ሣሩ ይጠወልጋል አበባውም ይረግፋል፤ የአምላካችን ቃል ግን ለዘላለም ጸንቶ ይኖራል።", reference: "ኢሳይያስ 40:8" },
];

function getDailyVerse() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

export default function DailyVerse() {
  const verse = getDailyVerse();
  const { language } = useLanguage();

  return (
    <section className="py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-navy-500 via-navy-600 to-navy-800 dark:from-navy-800 dark:via-navy-900 dark:to-navy-950" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,168,83,0.15),transparent_60%)]" />

            <div className="relative px-6 py-8 sm:px-10 sm:py-10">
              {/* Header */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <BookOpen className="w-4 h-4 text-gold-400" />
                <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.2em]">
                  {language === "am" ? "የዕለቱ ቃል" : "Daily Verse"}
                </span>
              </div>

              {/* Quote */}
              <blockquote className="text-center mb-5">
                <p className="text-base sm:text-lg md:text-xl text-white/90 font-medium leading-relaxed">
                  &ldquo;{verse.text}&rdquo;
                </p>
              </blockquote>

              {/* Reference */}
              <div className="flex items-center justify-center">
                <span className="px-4 py-1.5 rounded-full bg-white/10 text-gold-500 text-sm font-bold">
                  {verse.reference}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
