"use client";

import Link from "next/link";
import { BookOpen, Mail, Heart, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Thank you for subscribing!");
    setEmail("");
    setSubscribing(false);
  };

  return (
    <footer className="bg-navy-950 dark:bg-[#0a0f1a] text-white relative overflow-hidden">
      {/* Newsletter */}
      <div className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <div className="max-w-3xl mx-auto">
            <div className="bg-navy-gradient rounded-2xl p-6 sm:p-10 relative overflow-hidden">
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-5">
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Stay Connected in Faith</h3>
                  <p className="text-white/70 text-sm sm:text-base">Weekly devotionals and new resources</p>
                </div>
                <form onSubmit={handleSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 px-4 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 w-full sm:w-64"
                    required
                  />
                  <Button type="submit" disabled={subscribing} className="h-12 px-6 rounded-xl bg-white text-navy-600 hover:bg-white/90 font-bold">
                    {subscribing ? "..." : <><Send className="w-4 h-4 mr-1" /> Subscribe</>}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="relative z-10 container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-navy-gradient flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Hena Books</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              A ministry dedicated to providing biblically-sound resources for spiritual growth.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/books", label: "Browse Books" },
                { href: "/books?category=DEVOTIONAL", label: "Devotionals" },
                { href: "/books?category=BIBLICAL_STUDIES", label: "Bible Studies" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4 text-sm">Categories</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/books?category=CHRISTIAN_LIVING", label: "Christian Living" },
                { href: "/books?category=PRAYER_WORSHIP", label: "Prayer & Worship" },
                { href: "/books?category=SPIRITUAL_GROWTH", label: "Spiritual Growth" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-sm">Contact</h4>
            <a href="mailto:contact@henabooks.com" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
              <Mail className="w-4 h-4" /> contact@henabooks.com
            </a>
            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 italic leading-relaxed">
                &ldquo;የእግዚአብሔር መንፈስ ያለበት መጽሐፍ ሁሉ ለትምህርትና ለተግሣጽ... ይጠቅማል።&rdquo;
              </p>
              <p className="text-[10px] text-gold-400 mt-1 font-semibold">— 2 ጢሞቴዎስ 3:16</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="relative z-10 border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/40">
            <p className="flex items-center gap-1">
              &copy; {new Date().getFullYear()} Hena Books. Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for the glory of God.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
