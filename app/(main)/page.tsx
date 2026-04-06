"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/home/HeroSection";
import BookSpotlight from "@/components/home/BookSpotlight";
import DailyVerse from "@/components/home/DailyVerse";
import MissionSection from "@/components/home/MissionSection";
import AboutSection from "@/components/home/AboutSection";
import { analyticsService } from "@/lib/services/analytics";

export default function HomePage() {
  const [stats, setStats] = useState<{
    totalBooks: number;
    totalUsers: number;
    totalSessions: number;
  } | null>(null);

  useEffect(() => {
    analyticsService
      .getOverviewStats()
      .then((data) =>
        setStats({
          totalBooks: data.total_books,
          totalUsers: data.total_users,
          totalSessions: data.total_reading_sessions,
        })
      )
      .catch(() => {});
  }, []);

  return (
    <>
      <HeroSection stats={stats} />
      <BookSpotlight />
      <DailyVerse />
      <MissionSection />
      <div id="about">
        <AboutSection />
      </div>
    </>
  );
}
