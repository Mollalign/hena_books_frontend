export default function About() {
    return (
        <section id="about" className="section">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Image/Illustration Side */}
                    <div className="relative order-2 lg:order-1">
                        <div className="relative">
                            {/* Background Shape */}
                            <div className="absolute -inset-4 bg-gradient-to-br from-[var(--primary-100)] to-[var(--primary-200)] dark:from-[var(--primary-900)]/20 dark:to-[var(--primary-800)]/20 rounded-3xl transform rotate-3" />

                            {/* Main Content */}
                            <div className="relative bg-[var(--surface-card)] rounded-2xl p-8 shadow-xl border border-[var(--border)]">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] flex items-center justify-center">
                                        <span className="text-4xl">👤</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Henok</h3>
                                        <p className="text-[var(--muted)]">Author & Creator</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">✍️</span>
                                        <span className="text-[var(--muted)]">Passionate Writer</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">📚</span>
                                        <span className="text-[var(--muted)]">5+ Books Written</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🌍</span>
                                        <span className="text-[var(--muted)]">Ethiopia Based</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="order-1 lg:order-2">
                        <span className="inline-block px-4 py-2 rounded-full bg-[var(--primary-100)] text-[var(--primary-700)] text-sm font-semibold mb-6 dark:bg-[var(--primary-900)]/30 dark:text-[var(--primary-300)]">
                            👋 About The Author
                        </span>

                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            A Journey of{" "}
                            <span className="gradient-text">Words & Imagination</span>
                        </h2>

                        <div className="space-y-4 text-[var(--muted)]">
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
                            <p>
                                Thank you for being part of this journey. I hope my books bring
                                you as much joy in reading as I had in writing them.
                            </p>
                        </div>

                        {/* Quote */}
                        <blockquote className="mt-8 pl-6 border-l-4 border-[var(--primary-500)]">
                            <p className="text-lg italic text-[var(--foreground)]">
                                "Every story has the power to change a life. My mission is to
                                write stories that matter."
                            </p>
                            <footer className="mt-2 text-[var(--primary-500)] font-semibold">
                                — Henok
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </section>
    );
}
