"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Mail, Phone, MapPin, Heart, Send, Cross } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubscribing(true);
    // TODO: Implement newsletter subscription backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Thank you for subscribing! May God bless you.");
    setEmail("");
    setSubscribing(false);
  };

  return (
    <footer className="bg-[var(--surface-light)] dark:bg-[#1f1a16] border-t border-[var(--border)]">
      {/* Newsletter Section */}
      <div className="border-b border-[var(--border)]">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] mb-6 shadow-lg">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 font-serif">
              Stay Connected in Faith
            </h3>
            <p className="text-muted-foreground mb-6 text-base sm:text-lg">
              Receive weekly devotionals, new book recommendations, and spiritual encouragement straight to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12"
                required
              />
              <Button 
                type="submit" 
                disabled={subscribing}
                className="h-12 px-6 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] text-white"
              >
                {subscribing ? (
                  "Subscribing..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)]">
                Hena Books
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              A ministry dedicated to providing biblical resources that help believers grow in their faith and walk with Christ. Our mission is to make transformative Christian literature accessible to all.
            </p>
            <p className="scripture-quote text-sm italic">
              "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness."
              <span className="block mt-1 scripture-reference">— 2 Timothy 3:16</span>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground font-serif">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: "/books", label: "Browse Books" },
                { href: "/books?category=DEVOTIONAL", label: "Devotionals" },
                { href: "/books?category=BIBLICAL_STUDIES", label: "Bible Studies" },
                { href: "/books?category=THEOLOGY", label: "Theology" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-[var(--primary-600)] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground font-serif">Categories</h4>
            <ul className="space-y-2">
              {[
                { href: "/books?category=CHRISTIAN_LIVING", label: "Christian Living" },
                { href: "/books?category=PRAYER_WORSHIP", label: "Prayer & Worship" },
                { href: "/books?category=FAMILY_MARRIAGE", label: "Family & Marriage" },
                { href: "/books?category=SPIRITUAL_GROWTH", label: "Spiritual Growth" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-[var(--primary-600)] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground font-serif">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--primary-500)]" />
                <span>contact@henabooks.com</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--primary-500)]" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--primary-500)]" />
                <span>Serving believers worldwide</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--border)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              © {new Date().getFullYear()} Hena Books. Made with{" "}
              <Heart className="w-4 h-4 text-[var(--primary-500)] fill-current" /> for the glory of God.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-[var(--primary-600)] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[var(--primary-600)] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
