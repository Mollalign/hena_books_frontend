import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center animated-bg overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary-500)]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent-500)]/20 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 pt-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="animate-fade-in">
                        <span className="inline-block px-4 py-2 rounded-full bg-[var(--primary-100)] text-[var(--primary-700)] text-sm font-semibold mb-6 dark:bg-[var(--primary-900)]/30 dark:text-[var(--primary-300)]">
                            ✨ Welcome to Hena Books
                        </span>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                            Discover Stories That{" "}
                            <span className="gradient-text">Inspire</span> and{" "}
                            <span className="gradient-text">Transform</span>
                        </h1>

                        <p className="text-lg md:text-xl text-[var(--muted)] mb-8 max-w-xl">
                            Explore a collection of captivating books written with passion.
                            Dive into worlds of imagination, knowledge, and inspiration.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/books" className="btn-primary text-lg px-8 py-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Explore Books
                            </Link>
                            <Link href="/register" className="btn-secondary text-lg px-8 py-4">
                                Create Account
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 mt-12 pt-8 border-t border-[var(--border)]">
                            <div>
                                <div className="text-3xl font-bold gradient-text">5+</div>
                                <div className="text-[var(--muted)] text-sm">Books Written</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold gradient-text">1000+</div>
                                <div className="text-[var(--muted)] text-sm">Readers</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold gradient-text">4.9</div>
                                <div className="text-[var(--muted)] text-sm">Avg Rating</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Book Illustration */}
                    <div className="relative hidden lg:block">
                        <div className="relative animate-float">
                            {/* Main Book Card */}
                            <div className="relative bg-gradient-to-br from-[var(--primary-600)] to-[var(--primary-800)] rounded-2xl p-8 shadow-2xl transform rotate-3">
                                <div className="absolute inset-0 bg-white/5 rounded-2xl" />
                                <div className="relative z-10">
                                    <div className="w-full aspect-[3/4] bg-gradient-to-br from-[var(--accent-400)] to-[var(--accent-600)] rounded-lg mb-4 flex items-center justify-center">
                                        <span className="text-6xl">📖</span>
                                    </div>
                                    <h3 className="text-white text-xl font-bold">Featured Book</h3>
                                    <p className="text-white/70 text-sm">Coming Soon...</p>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-8 -left-8 bg-[var(--surface-card)] rounded-xl p-4 shadow-lg border border-[var(--border)]">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⭐</span>
                                    <span className="font-bold">4.9/5.0</span>
                                </div>
                            </div>

                            <div className="absolute -bottom-4 -right-4 bg-[var(--surface-card)] rounded-xl p-4 shadow-lg border border-[var(--border)]">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">👥</span>
                                    <span className="font-bold">1K+ Readers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <svg className="w-6 h-6 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
}
