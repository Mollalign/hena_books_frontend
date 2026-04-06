import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-navy-gradient flex items-center justify-center mx-auto mb-5 shadow-lg">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-navy-500 mb-2">404</h1>
        <h2 className="text-xl font-bold mb-3">ገጹ አልተገኘም</h2>
        <p className="text-muted-foreground mb-6">
          የፈለጉት ገጽ አይገኝም ወይም ተዛውሯል ።
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-navy-gradient text-white font-semibold shadow-lg active:scale-[0.97] transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          ወደ መነሻ ይመለሱ
        </Link>
      </div>
    </div>
  );
}
