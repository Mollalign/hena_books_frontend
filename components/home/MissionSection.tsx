import Link from "next/link";
import { Globe, CheckCircle2, ArrowRight, Quote, BookOpen } from "lucide-react";

export default function MissionSection() {
  return (
    <section id="about" className="py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border mb-5">
              <Globe className="w-4 h-4 text-navy-500" />
              <span className="text-sm font-semibold">ዓላማችን</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 leading-tight">
              የእግዚአብሔርን ቃል
              <span className="block text-navy-500">ለሁሉም ማድረስ</span>
            </h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              ብፅዕና (Hena Books) አማኞች መጽሐፍ ቅዱሳዊ በሆኑ ግብዓቶች እንዲታጠቁ የተቋቋመ
              አገልግሎት ነው። ሕይወትን የሚለውጡ ክርስቲያናዊ ጽሑፎች በየትኛውም ቦታና የገንዘብ
              ሁኔታ ላይ ላለ ሰው ሁሉ በቀላሉ መድረስ አለባቸው ብለን እናምናለን።
            </p>

            <div className="space-y-3 mb-6">
              {[
                "በጥንቃቄ የተመረጡ የፕሮቴስታንት ግብዓቶች",
                "ለግል እና ለቡድን ጥናት የሚመቹ",
                "100% ነፃ፣ ምንም ዓይነት ክፍያ የሌለባቸው",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium text-sm">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-navy-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.97]"
            >
              ቤተ-መጻሕፍቱን ይጎብኙ
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-navy-100 to-gold-100 dark:from-navy-900 dark:to-gold-900/30 rounded-3xl" />
              <div className="absolute inset-8 bg-background rounded-2xl shadow-2xl p-8 flex flex-col justify-center">
                <Quote className="w-10 h-10 text-navy-500 mb-5" />
                <blockquote className="text-xl font-medium leading-relaxed mb-5 italic">
                  &ldquo;እንግዲህ እምነት ከመስማት ነው መስማትም በእግዚአብሔር ቃል ነው።&rdquo;
                </blockquote>
                <cite className="text-navy-500 font-bold">— ሮሜ 10:17</cite>
                <div className="absolute bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
