"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import FeaturedBooks from "@/components/FeaturedBooks";
import Footer from "@/components/Footer";
import { analyticsService } from "@/lib/services/analytics";
import {
  BookOpen, Heart, Users, Shield, ArrowRight, Sparkles,
  BookText, Quote, CheckCircle2, Zap, Globe, Star,
  ChevronRight, Play, Clock, TrendingUp
} from "lucide-react";

// Daily verses for rotation
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
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

export default function Home() {
  const [stats, setStats] = useState<{
    totalBooks: number;
    totalUsers: number;
    totalSessions: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const dailyVerse = getDailyVerse();

  useEffect(() => {
    setIsVisible(true);
    analyticsService
      .getOverviewStats()
      .then((data) => {
        setStats({
          totalBooks: data.total_books,
          totalUsers: data.total_users,
          totalSessions: data.total_reading_sessions,
        });
      })
      .catch(() => { });
  }, []);

  const featuredCategories = [
    { value: "DEVOTIONAL", label: "Devotional", icon: Heart, description: "Daily inspiration" },
    { value: "BIBLICAL_STUDIES", label: "Bible Studies", icon: BookOpen, description: "Deep diving" },
    { value: "THEOLOGY", label: "Theology", icon: BookText, description: "Core doctrines" },
    { value: "CHRISTIAN_LIVING", label: "Christian Living", icon: Users, description: "Practical faith" },
    { value: "PRAYER_WORSHIP", label: "Prayer & Worship", icon: Sparkles, description: "Growing closer" },
    { value: "SPIRITUAL_GROWTH", label: "Spiritual Growth", icon: TrendingUp, description: "Maturing faith" },
  ];

  const features = [
    {
      icon: BookOpen,
      title: "መጽሐፍ ቅዱሳዊ",
      description: "ሁሉም ግብዓቶች ከፕሮቴስታንት መጽሐፍ ቅዱሳዊ ትምህርት ጋር የተጣጣሙ ናቸው",
      stat: "100%",
      statLabel: "የተረጋገጠ ይዘት"
    },
    {
      icon: Zap,
      title: "በየትኛውም ቦታ ያንብቡ",
      description: "ቤተ-መጻሕፍትዎን በማንኛውም መሣሪያ፣ በማንኛውም ጊዜ ያግኙ",
      stat: "24/7",
      statLabel: "ተደራሽነት"
    },
    {
      icon: Heart,
      title: "ለዘላለም ነፃ",
      description: "ምንም የተደበቀ ክፍያ ወይም የደንበኝነት ምዝገባ አያስፈልግም",
      stat: "100%",
      statLabel: "ነፃ"
    },
  ];


  return (
    <>
      <Navbar />
      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-[var(--primary-500)]/20 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-[var(--accent-500)]/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary-500)]/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--accent-100)] to-[var(--accent-200)] dark:from-[var(--accent-900)]/50 dark:to-[var(--accent-800)]/50 border border-[var(--accent-300)] dark:border-[var(--accent-700)] mb-8">
                <Star className="w-4 h-4 text-[var(--accent-600)] fill-[var(--accent-500)]" />
                <span className="text-sm font-semibold text-[var(--accent-700)] dark:text-[var(--accent-300)]">
                  የብፁዓን መፅሃፍት መደብር
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
                ወደ ብፁዓን መፅሐፍት መደብር
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-500)] via-[var(--primary-600)] to-[var(--accent-500)]">
                  እንኳን በደህና መጡ ።
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                መንፈሳዊ ሕይወትዎን የሚያሳድጉ የመጽሐፍ ቅዱስ ትምህርቶችን፣ የጸሎት መመሪያዎችንና መጻሕፍትን እዚህ ያገኛሉ።
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/books"
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white overflow-hidden transition-all hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-600)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Start Reading
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-foreground bg-background border-2 border-[var(--border)] hover:border-[var(--primary-300)] hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] transition-all"
                >
                  <Sparkles className="w-5 h-5 text-[var(--accent-500)]" />
                  Create Free Account
                </Link>
              </div>

              {/* Stats Row */}
              {stats && (
                <div className="flex flex-wrap justify-center gap-8 sm:gap-12 pt-8 border-t border-[var(--border)]">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-foreground">{stats.totalBooks}+</div>
                    <div className="text-sm text-muted-foreground font-medium">Books Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-foreground">{stats.totalUsers}+</div>
                    <div className="text-sm text-muted-foreground font-medium">Active Readers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-foreground">{stats.totalSessions}+</div>
                    <div className="text-sm text-muted-foreground font-medium">Reading Sessions</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-[var(--border)] flex justify-center pt-2">
              <div className="w-1 h-2 bg-[var(--primary-500)] rounded-full" />
            </div>
          </div>
        </section>

        {/* Daily Verse Section */}
        <section className="py-16 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)] via-[var(--primary-600)] to-[var(--primary-700)]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0xMHY2aDZ2LTZoLTZ6bTAtMTB2Nmg2di02aC02em0tMTAgMTB2Nmg2di02aC02em0wIDEwdjZoNnYtNmgtNnptMC0yMHY2aDZ2LTZoLTZ6bS0xMCAyMHY2aDZ2LTZoLTZ6bTAgLTEwdjZoNnYtNmgtNnptMC0xMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/20">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Quote className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <p className="text-xs sm:text-sm font-medium text-white/60 uppercase tracking-wider mb-3">
                      Today's Scripture
                    </p>
                    <blockquote className="text-xl sm:text-2xl md:text-3xl text-white font-medium leading-relaxed mb-4 italic">
                      "{dailyVerse.text}"
                    </blockquote>
                    <cite className="text-[var(--accent-300)] font-bold text-lg">— {dailyVerse.reference}</cite>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 sm:py-24 bg-background relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--muted)] border border-[var(--border)] mb-4">
                <BookText className="w-4 h-4 text-[var(--primary-500)]" />
                <span className="text-sm font-semibold text-foreground">Categories</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Explore by Topic
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Find exactly what you need for your spiritual journey
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
              {featuredCategories.map((cat, idx) => (
                <Link
                  key={cat.value}
                  href={`/books?category=${cat.value}`}
                  className="group relative p-6 rounded-2xl bg-card border border-[var(--border)] hover:border-[var(--primary-300)] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl text-center overflow-hidden"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)]/0 to-[var(--primary-500)]/0 group-hover:from-[var(--primary-500)]/5 group-hover:to-[var(--accent-500)]/5 transition-all duration-300" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                      <cat.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{cat.label}</h3>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--muted)] hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] border border-[var(--border)] hover:border-[var(--primary-300)] font-semibold transition-all"
              >
                View All Books
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <FeaturedBooks />

        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-[var(--muted)]/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-[var(--border)] mb-4">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-foreground">Why Hena Books?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Built for Believers
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Everything you need to grow in faith, all in one place
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="group relative p-6 sm:p-8 rounded-3xl bg-background border border-[var(--border)] hover:border-[var(--primary-300)] hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--primary-500)]">{feature.stat}</div>
                      <div className="text-xs text-muted-foreground">{feature.statLabel}</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About/Mission Section */}
        <section id="about" className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Content */}
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--muted)] border border-[var(--border)] mb-6">
                    <Globe className="w-4 h-4 text-[var(--primary-500)]" />
                    <span className="text-sm font-semibold text-foreground">ዓላማችን</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    የእግዚአብሔርን ቃል
                    <span className="block text-[var(--primary-500)]">ለሁሉም ማድረስ</span>
                  </h2>

                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    ብፅዕና (Hena Books) አማኞች መጽሐፍ ቅዱሳዊ በሆኑ ግብዓቶች እንዲታጠቁ የተቋቋመ አገልግሎት ነው።
                    ሕይወትን የሚለውጡ ክርስቲያናዊ ጽሑፎች በየትኛውም ቦታና የገንዘብ ሁኔታ ላይ ላለ ሰው ሁሉ በቀላሉ መድረስ አለባቸው ብለን እናምናለን።
                  </p>

                  <div className="space-y-4 mb-8">
                    {[
                      "በጥንቃቄ የተመረጡ የፕሮቴስታንት ግብዓቶች",
                      "ለግል እና ለቡድን ጥናት የሚመቹ",
                      "100% ነፃ፣ ምንም ዓይነት ክፍያ የሌለባቸው"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-foreground font-medium">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/books"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white font-semibold hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] transition-all shadow-lg hover:shadow-xl"
                  >
                    ቤተ-መጻሕፍቱን ይጎብኙ
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Visual */}
                <div className="relative hidden lg:block">
                  <div className="relative aspect-square">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-100)] to-[var(--accent-100)] dark:from-[var(--primary-900)] dark:to-[var(--accent-900)] rounded-3xl" />

                    {/* Quote card */}
                    <div className="absolute inset-8 bg-background rounded-2xl shadow-2xl p-8 flex flex-col justify-center">
                      <Quote className="w-12 h-12 text-[var(--primary-500)] mb-6" />
                      <blockquote className="text-2xl font-medium text-foreground leading-relaxed mb-6 italic">
                        "እንግዲህ እምነት ከመስማት ነው መስማትም በእግዚአብሔር ቃል ነው።"
                      </blockquote>
                      <cite className="text-[var(--primary-500)] font-bold text-lg">— ሮሜ 10:17</cite>

                      {/* Decorative element */}
                      <div className="absolute bottom-8 right-8 w-20 h-20 bg-gradient-to-br from-[var(--accent-400)] to-[var(--accent-500)] rounded-2xl flex items-center justify-center shadow-lg">
                        <BookOpen className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section id="contact" className="py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)] via-[var(--primary-600)] to-[var(--primary-700)]" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--accent-500)]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-8">
                <Sparkles className="w-4 h-4 text-[var(--accent-300)]" />
                <span className="text-sm font-semibold text-white">Start Your Journey</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Ready to Grow in Faith?
              </h2>

              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of believers discovering life-changing Christian resources.
                Your spiritual journey starts here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[var(--primary-600)] rounded-2xl font-bold text-lg hover:bg-[var(--accent-100)] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  <Sparkles className="w-5 h-5 text-[var(--accent-500)]" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/books"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-2xl font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  Browse Library
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
