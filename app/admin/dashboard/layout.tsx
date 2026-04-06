"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import Navbar from "@/components/Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 lg:ml-72 w-full min-w-0 p-4 sm:p-6 lg:p-8 pt-24 lg:pt-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
