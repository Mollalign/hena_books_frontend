"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import Navbar from "@/components/Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 lg:ml-60 w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6 pt-20 lg:pt-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
