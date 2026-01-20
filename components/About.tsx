"use client";

import { Quote, Heart, BookOpen, Globe, Cross, Church, Users } from "lucide-react";

export default function About() {
    return (
        <section id="about" className="py-12 sm:py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
                    {/* Content Side */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] w-fit">
                            <span className="text-xs sm:text-sm font-medium text-[var(--primary-700)] dark:text-[var(--primary-300)]">
                                Our Ministry
                            </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight font-serif">
                            Sharing God's Word{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-600)] to-[var(--accent-500)]">
                                with the World
                            </span>
                        </h2>

                        <div className="space-y-3 sm:space-y-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
                            <p>
                                Hena Books is a ministry dedicated to equipping believers with biblically-sound
                                resources that nurture spiritual growth and deepen understanding of God's Word.
                                We believe that transformative Christian literature should be accessible to all.
                            </p>
                            <p>
                                Our curated collection includes devotionals, Bible studies, theological works,
                                and practical guides for Christian living—all carefully selected to help you 
                                grow in faith and walk closer with Christ.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4">
                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] flex items-center justify-center flex-shrink-0">
                                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium">Faith-Centered</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium">Bible-Based</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent-500)] flex items-center justify-center flex-shrink-0">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium">Community</span>
                            </div>
                        </div>

                        {/* Quote */}
                        <div className="p-4 sm:p-6 rounded-xl bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] mt-4 sm:mt-6">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] flex items-center justify-center flex-shrink-0">
                                    <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-base sm:text-lg italic text-foreground font-medium mb-2 font-serif">
                                        "So faith comes from hearing, and hearing through the word of Christ."
                                    </p>
                                    <footer className="text-[var(--primary-600)] font-semibold text-sm sm:text-base">
                                        — Romans 10:17
                                    </footer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image/Illustration Side */}
                    <div className="relative hidden lg:block">
                        <div className="relative">
                            <div className="w-full aspect-[3/4] bg-gradient-to-br from-[var(--primary-400)] via-[var(--primary-600)] to-[var(--primary-800)] rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                                {/* Subtle cross pattern */}
                                <div className="absolute inset-0 opacity-10" style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 15v30M20 25h20' stroke='%23ffffff' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                                }} />
                                <div className="text-center space-y-4 relative z-10 p-8">
                                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                                        <BookOpen className="w-12 h-12 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2 font-serif">Hena Books</h3>
                                        <p className="text-white/80">Growing in Faith Together</p>
                                    </div>
                                    <div className="pt-4 text-white/70 text-sm italic max-w-xs mx-auto">
                                        "Your word is a lamp to my feet and a light to my path"
                                        <span className="block mt-1 font-medium">Psalm 119:105</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
