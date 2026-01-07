"use client";

import { Quote, PenTool, BookOpen, Globe } from "lucide-react";

export default function About() {
    return (
        <section id="about" className="py-12 sm:py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
                    {/* Content Side */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] w-fit">
                            <span className="text-xs sm:text-sm font-medium text-[var(--primary-700)] dark:text-[var(--primary-300)]">
                                About The Author
                            </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                            A Journey of{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-600)] to-[var(--accent-500)]">
                                Words & Imagination
                            </span>
                        </h2>

                        <div className="space-y-3 sm:space-y-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
                            <p>
                                Hello! I'm Henok, a passionate author dedicated to crafting stories
                                that resonate with readers across the globe. My journey with words
                                began years ago, and it has been an incredible adventure ever since.
                            </p>
                            <p>
                                Each book I write is a piece of my heart, carefully woven with
                                experiences, dreams, and a deep desire to inspire. Whether it's
                                fiction, self-help, or thought-provoking narratives, my goal is
                                to create content that leaves a lasting impact.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4">
                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] flex items-center justify-center flex-shrink-0">
                                    <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium">Passionate Writer</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium">5+ Books</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent-500)] flex items-center justify-center flex-shrink-0">
                                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium">Ethiopia Based</span>
                            </div>
                        </div>

                        {/* Quote */}
                        <div className="p-4 sm:p-6 rounded-xl bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] mt-4 sm:mt-6">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] flex items-center justify-center flex-shrink-0">
                                    <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-base sm:text-lg italic text-foreground font-medium mb-2">
                                        "Every story has the power to change a life. My mission is to
                                        write stories that matter."
                                    </p>
                                    <footer className="text-[var(--primary-600)] font-semibold text-sm sm:text-base">
                                        — Henok
                                    </footer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image/Illustration Side */}
                    <div className="relative hidden lg:block">
                        <div className="relative">
                            <div className="w-full aspect-[3/4] bg-gradient-to-br from-[var(--primary-400)] via-[var(--primary-600)] to-[var(--primary-800)] rounded-2xl flex items-center justify-center shadow-2xl">
                                <div className="text-center space-y-4">
                                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                                        <span className="text-6xl">👤</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1">Henok</h3>
                                        <p className="text-white/80">Author & Creator</p>
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
