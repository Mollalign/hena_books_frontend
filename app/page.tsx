"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedBooks from "@/components/FeaturedBooks";
import About from "@/components/About";
import Footer from "@/components/Footer";
import { analyticsService } from "@/lib/services/analytics";

export default function Home() {
  const [stats, setStats] = useState<{
    totalBooks: number;
    totalUsers: number;
    totalSessions: number;
  } | null>(null);

  useEffect(() => {
    // Try to fetch stats, but don't fail if not authenticated
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

  return (
    <>
      <Navbar />
      <main className="relative pt-16 sm:pt-20">
        <Hero stats={stats} />
        <FeaturedBooks />
        <About />
      </main>
      <Footer />
    </>
  );
}
