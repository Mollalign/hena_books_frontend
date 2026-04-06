import { Quote } from "lucide-react";
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
    <section className="py-12 sm:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-navy-gradient" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-10 border border-white/20">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
                  {language === "am" ? "የዛሬ ቅዱስ ቃል" : "Daily Verse"}
                </p>
                <blockquote className="text-lg sm:text-xl md:text-2xl text-white font-medium leading-relaxed mb-3 italic">
                  &ldquo;{verse.text}&rdquo;
                </blockquote>
                <cite className="text-gold-300 font-bold text-base">
                  — {verse.reference}
                </cite>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
