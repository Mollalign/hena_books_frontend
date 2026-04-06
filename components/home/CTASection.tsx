import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";

export default function CTASection() {
  return (
    <section id="contact" className="py-12 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-navy-gradient" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-gold-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold-300" />
            <span className="text-sm font-semibold text-white">
              ጉዞዎን ይጀምሩ
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            በእምነት ለማደግ ዝግጁ ነዎት?
          </h2>

          <p className="text-base sm:text-lg text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
            ሕይወትን የሚለውጡ ክርስቲያናዊ መጽሐፍትን ያግኙ ። መንፈሳዊ ጉዞዎ እዚህ ይጀምራል ።
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-navy-600 rounded-2xl font-bold hover:bg-gold-100 transition-all shadow-xl active:scale-[0.97]"
            >
              <Sparkles className="w-5 h-5 text-gold-500" />
              በነጻ ይጀምሩ
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/books"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-[0.97]"
            >
              <BookOpen className="w-5 h-5" />
              መጽሐፍት ያስሱ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
