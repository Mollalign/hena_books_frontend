"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Mail, Heart, Send, ArrowRight, Github, Twitter, Facebook } from "lucide-react";
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Thank you for subscribing! May God bless you.");
    setEmail("");
    setSubscribing(false);
  };

  const quickLinks = [
    { href: "/books", label: "Browse Books" },
    { href: "/books?category=DEVOTIONAL", label: "Devotionals" },
    { href: "/books?category=BIBLICAL_STUDIES", label: "Bible Studies" },
    { href: "/books?category=THEOLOGY", label: "Theology" },
  ];

  const categories = [
    { href: "/books?category=CHRISTIAN_LIVING", label: "Christian Living" },
    { href: "/books?category=PRAYER_WORSHIP", label: "Prayer & Worship" },
    { href: "/books?category=FAMILY_MARRIAGE", label: "Family & Marriage" },
    { href: "/books?category=SPIRITUAL_GROWTH", label: "Spiritual Growth" },
  ];

  return (
    <footer className="bg-[var(--primary-950)] dark:bg-[#0a0f1a] text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary-500)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--accent-500)]/10 rounded-full blur-3xl" />
      
      {/* Newsletter Section */}
      <div className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] rounded-3xl p-8 sm:p-12 relative overflow-hidden">
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                    Stay Connected in Faith
                  </h3>
                  <p className="text-white/80 text-lg">
                    Weekly devotionals, new resources, and spiritual encouragement
                  </p>
                </div>
                <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 px-6 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 w-full sm:w-72"
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={subscribing}
                    className="h-14 px-8 rounded-xl bg-white text-[var(--primary-600)] hover:bg-white/90 font-bold"
                  >
                    {subscribing ? (
                      "Subscribing..."
                    ) : (
                      <>
                        Subscribe
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-600)] flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Hena Books</span>
            </Link>
            <p className="text-white/60 leading-relaxed mb-6">
              A ministry dedicated to providing biblically-sound resources for spiritual growth and deeper understanding of God's Word.
            </p>
            <div className="flex gap-3">
              {[Twitter, Facebook, Github].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-lg mb-6">Categories</h4>
            <ul className="space-y-4">
              {categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6">Contact Us</h4>
            <div className="space-y-4">
              <a
                href="mailto:contact@henabooks.com"
                className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span>contact@henabooks.com</span>
              </a>
            </div>
            
            {/* Scripture Quote */}
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/60 italic leading-relaxed">
                "All Scripture is breathed out by God and profitable for teaching..."
              </p>
              <p className="text-xs text-[var(--accent-400)] mt-2 font-semibold">— 2 Timothy 3:16</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/50">
            <p className="flex items-center gap-1">
              © {new Date().getFullYear()} Hena Books. Made with{" "}
              <Heart className="w-4 h-4 text-red-400 fill-red-400" /> for the glory of God.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
