"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedBooks from "@/components/FeaturedBooks";
import About from "@/components/About";
import Footer from "@/components/Footer";
import { analyticsService } from "@/lib/services/analytics";
import { BookOpen, Heart, Users, Shield, ArrowRight, Sparkles, BookText, Cross } from "lucide-react";
import { BOOK_CATEGORIES } from "@/lib/services/books";

// Daily verses for rotation
const DAILY_VERSES = [
  { text: "Your word is a lamp to my feet and a light to my path.", reference: "Psalm 119:105" },
  { text: "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness.", reference: "2 Timothy 3:16" },
  { text: "So faith comes from hearing, and hearing through the word of Christ.", reference: "Romans 10:17" },
  { text: "For the word of God is living and active, sharper than any two-edged sword.", reference: "Hebrews 4:12" },
  { text: "But be doers of the word, and not hearers only, deceiving yourselves.", reference: "James 1:22" },
  { text: "Heaven and earth will pass away, but my words will not pass away.", reference: "Matthew 24:35" },
  { text: "The grass withers, the flower fades, but the word of our God will stand forever.", reference: "Isaiah 40:8" },
];

// Get verse based on day of year
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

  const dailyVerse = getDailyVerse();

  useEffect(() => {
    analyticsService
      .getOverviewStats()
      .then((data) => {
        setStats({
          totalBooks: data.total_books,
          totalUsers: data.total_users,
          totalSessions: data.total_reading_sessions,
        });
      })
      .catch(() => {
        // Silently fail - stats are optional
      });
  }, []);

  // Featured categories to display
  const featuredCategories = [
    { value: "DEVOTIONAL", label: "Devotional", icon: Heart, color: "from-rose-500 to-pink-600" },
    { value: "BIBLICAL_STUDIES", label: "Bible Studies", icon: BookOpen, color: "from-[var(--primary-500)] to-[var(--primary-600)]" },
    { value: "THEOLOGY", label: "Theology", icon: BookText, color: "from-indigo-500 to-purple-600" },
    { value: "CHRISTIAN_LIVING", label: "Christian Living", icon: Users, color: "from-emerald-500 to-teal-600" },
    { value: "PRAYER_WORSHIP", label: "Prayer & Worship", icon: Sparkles, color: "from-amber-500 to-orange-600" },
    { value: "SPIRITUAL_GROWTH", label: "Spiritual Growth", icon: Shield, color: "from-cyan-500 to-blue-600" },
  ];

  return (
    <>
      <Navbar />
      <main className="relative pt-16 sm:pt-20">
        <Hero stats={stats} />
        
        {/* Daily Verse Section */}
        <section className="py-12 sm:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-700)]" />
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 15v30M20 25h20' stroke='%23ffffff' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
          }} />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center text-white">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Daily Scripture</span>
              </div>
              <blockquote className="text-xl sm:text-2xl md:text-3xl font-serif italic leading-relaxed mb-4">
                "{dailyVerse.text}"
              </blockquote>
              <cite className="text-white/80 font-semibold">— {dailyVerse.reference}</cite>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] mb-4">
                <BookText className="w-4 h-4 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
                <span className="text-sm font-medium text-[var(--primary-700)] dark:text-[var(--primary-300)]">
                  Browse by Category
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif mb-3">
                Explore Our Collections
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find the perfect resource for your spiritual journey across our carefully curated categories
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {featuredCategories.map((cat) => (
                <Link
                  key={cat.value}
                  href={`/books?category=${cat.value}`}
                  className="group relative p-4 sm:p-6 rounded-2xl bg-card border border-[var(--border)] hover:border-[var(--primary-300)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base">{cat.label}</h3>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 text-[var(--primary-600)] hover:text-[var(--primary-700)] font-semibold transition-colors"
              >
                View All Categories
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <FeaturedBooks />

        {/* Why Read With Us Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-[var(--surface-light)] dark:bg-[#1f1a16]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] mb-4">
                <Heart className="w-4 h-4 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
                <span className="text-sm font-medium text-[var(--primary-700)] dark:text-[var(--primary-300)]">
                  Our Commitment
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif mb-3">
                Why Read With Us?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're committed to providing quality biblical resources that honor God and edify believers
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: BookOpen,
                  title: "Biblically Sound",
                  description: "Every resource is carefully reviewed to ensure alignment with Protestant biblical teaching",
                },
                {
                  icon: Shield,
                  title: "Trusted Authors",
                  description: "Works from respected theologians, pastors, and Christian teachers",
                },
                {
                  icon: Users,
                  title: "Community Focus",
                  description: "Resources designed for personal study and small group discussions",
                },
                {
                  icon: Heart,
                  title: "Heart for Ministry",
                  description: "Our mission is to make life-changing Christian literature accessible to all",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-card border border-[var(--border)] hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center mb-4 shadow-lg">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 font-serif">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-600)] via-[var(--primary-700)] to-[var(--primary-800)]" />
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4 leading-tight">
                Begin Your Journey of Faith Today
              </h2>
              <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
                Join thousands of believers growing in their faith through the power of God's Word. 
                Start reading today and transform your spiritual life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[var(--primary-700)] rounded-lg font-bold text-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/books"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-lg font-bold text-lg hover:bg-white/20 transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  Browse Books
                </Link>
              </div>
            </div>
          </div>
        </section>

        <About />
      </main>
      <Footer />
    </>
  );
}
