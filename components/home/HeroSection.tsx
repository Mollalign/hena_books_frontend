"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";

interface Props {
  stats: { totalBooks: number; totalUsers: number; totalSessions: number } | null;
}

export default function HeroSection({ stats }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(true), []);

  return (
    <section className="relative flex items-center min-h-[90dvh] py-8 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-10 w-72 md:w-[500px] h-72 md:h-[500px] bg-gradient-to-br from-navy-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-56 md:w-96 h-56 md:h-96 bg-gradient-to-tr from-gold-500/15 to-transparent rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.jpeg"
              alt="ብፅዕና"
              width={100}
              height={100}
              className="rounded-full shadow-2xl border-4 border-gold-300 dark:border-gold-600"
              priority
            />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-5 tracking-tight">
            ብፅዕና መጽሐፍት
            <span className="block mt-2 gradient-text-hero">
              እንኳን በደኅና መጡ ።
            </span>
          </h1>

          <p className="text-base sm:text-lg text-foreground/70 max-w-xl mx-auto mb-3 leading-relaxed">
            &ldquo;እግዚአብሔር ፍቅር ነዉ&rdquo; የተሰኘዉን መጽሐፍ ለማንበብ እንኳን በደኅና መጡ ።
          </p>
          <p className="text-sm sm:text-base text-foreground/60 max-w-lg mx-auto mb-8">
            የብፁዕ ሄኖክ ተስፋዬ የጽሑፍ ሥራ እዚህ ይገኛል ።
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              href="/books"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-white bg-navy-gradient shadow-lg hover:shadow-xl transition-all active:scale-[0.97]"
            >
              <BookOpen className="w-5 h-5" />
              ማንበብ ይጀምሩ
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold border-2 border-border hover:border-navy-300 hover:bg-navy-50 dark:hover:bg-navy-950 transition-all active:scale-[0.97]"
            >
              <Sparkles className="w-5 h-5 text-gold-500" />
              አካዉንት ይፍጠሩ
            </Link>
          </div>

          {stats && (
            <div className="flex flex-wrap justify-center gap-8 pt-6 border-t border-border">
              {[
                { value: stats.totalBooks, label: "መጽሐፍት" },
                { value: stats.totalUsers, label: "አንባቢዎች" },
                { value: stats.totalSessions, label: "ክፍለ-ጊዜዎች" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{s.value}+</div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
