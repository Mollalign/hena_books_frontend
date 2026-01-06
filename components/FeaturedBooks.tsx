import Link from "next/link";

// Placeholder featured books data (will be fetched from API later)
const featuredBooks = [
    {
        id: 1,
        title: "Coming Soon",
        description: "An exciting new book is on its way. Stay tuned for updates!",
        cover: "📚",
        isPlaceholder: true,
    },
];

export default function FeaturedBooks() {
    return (
        <section className="section bg-[var(--surface-light)]">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 rounded-full bg-[var(--primary-100)] text-[var(--primary-700)] text-sm font-semibold mb-4 dark:bg-[var(--primary-900)]/30 dark:text-[var(--primary-300)]">
                        📖 Featured Collection
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Explore <span className="gradient-text">Featured Books</span>
                    </h2>
                    <p className="text-[var(--muted)] max-w-2xl mx-auto">
                        Discover handpicked stories that will take you on unforgettable journeys.
                        Each book is crafted with care and passion.
                    </p>
                </div>

                {/* Books Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredBooks.map((book) => (
                        <div key={book.id} className="card group">
                            {/* Book Cover */}
                            <div className="relative aspect-[3/4] bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-700)] flex items-center justify-center overflow-hidden">
                                <span className="text-8xl group-hover:scale-110 transition-transform duration-300">
                                    {book.cover}
                                </span>
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                                {/* Badge */}
                                {book.isPlaceholder && (
                                    <span className="absolute top-4 right-4 px-3 py-1 bg-[var(--accent-500)] text-white text-xs font-semibold rounded-full">
                                        Coming Soon
                                    </span>
                                )}
                            </div>

                            {/* Book Info */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--primary-500)] transition-colors">
                                    {book.title}
                                </h3>
                                <p className="text-[var(--muted)] text-sm mb-4 line-clamp-2">
                                    {book.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[var(--accent-500)]">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                        <span className="text-xs text-[var(--muted)] ml-1">5.0</span>
                                    </div>

                                    <Link
                                        href={book.isPlaceholder ? "#" : `/books/${book.id}`}
                                        className="text-[var(--primary-500)] font-semibold text-sm hover:underline"
                                    >
                                        {book.isPlaceholder ? "Notify Me" : "Read Now →"}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Placeholder Cards */}
                    {[2, 3].map((i) => (
                        <div key={i} className="card opacity-60 group">
                            <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                <span className="text-6xl opacity-50">📕</span>
                                <span className="absolute top-4 right-4 px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">
                                    Coming Soon
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                                <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Link href="/books" className="btn-primary text-lg px-8 py-4">
                        View All Books
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
