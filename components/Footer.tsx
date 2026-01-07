"use client";

import Link from "next/link";
import { Mail, MapPin, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer id="contact" className="border-t border-[var(--border)] bg-[var(--primary-50)]/30 dark:bg-[var(--primary-950)]/20">
            {/* Newsletter Section */}
            <div className="py-16 sm:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <h3 className="text-2xl md:text-3xl font-bold">
                            Stay Updated on{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-600)] to-[var(--accent-500)]">
                                New Releases
                            </span>
                        </h3>
                        <p className="text-muted-foreground text-lg">
                            Subscribe to get notified when new books are published.
                        </p>

                        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-lg text-foreground bg-background border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] hover:from-[var(--primary-700)] hover:to-[var(--primary-800)] text-white font-semibold rounded-lg transition-all"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-[var(--border)]">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] flex items-center justify-center">
                                <span className="text-white font-bold text-xl">H</span>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-600)] to-[var(--accent-500)]">
                                Hena Books
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                            Discover stories that inspire, educate, and transform.
                            Your journey of imagination starts here.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-3">
                            <a 
                                href="#" 
                                className="w-10 h-10 rounded-lg bg-background border border-[var(--border)] hover:border-[var(--primary-500)] hover:text-[var(--primary-600)] flex items-center justify-center transition-all"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a 
                                href="#" 
                                className="w-10 h-10 rounded-lg bg-background border border-[var(--border)] hover:border-[var(--primary-500)] hover:text-[var(--primary-600)] flex items-center justify-center transition-all"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a 
                                href="#" 
                                className="w-10 h-10 rounded-lg bg-background border border-[var(--border)] hover:border-[var(--primary-500)] hover:text-[var(--primary-600)] flex items-center justify-center transition-all"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-muted-foreground hover:text-[var(--primary-600)] transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/books" className="text-muted-foreground hover:text-[var(--primary-600)] transition-colors">
                                    Books
                                </Link>
                            </li>
                            <li>
                                <Link href="#about" className="text-muted-foreground hover:text-[var(--primary-600)] transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="#contact" className="text-muted-foreground hover:text-[var(--primary-600)] transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-bold mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/login" className="text-muted-foreground hover:text-[var(--primary-600)] transition-colors">
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="text-muted-foreground hover:text-[var(--primary-600)] transition-colors">
                                    Create Account
                                </Link>
                            </li>
                            <li>
                                <Link href="/forgot-password" className="text-muted-foreground hover:text-[var(--primary-600)] transition-colors">
                                    Reset Password
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-[var(--primary-600)] transition-colors">
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold mb-4">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <div className="w-8 h-8 rounded-lg bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] flex items-center justify-center">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="text-sm">contact@henabooks.com</span>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <div className="w-8 h-8 rounded-lg bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] flex items-center justify-center">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="text-sm">Ethiopia</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-8 text-center">
                    <p className="text-muted-foreground text-sm">
                        © {currentYear} Hena Books. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
