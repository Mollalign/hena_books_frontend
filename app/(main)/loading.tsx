import { BookOpen } from "lucide-react";

export default function MainLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60dvh]">
      <div className="w-12 h-12 rounded-2xl bg-navy-gradient flex items-center justify-center animate-pulse">
        <BookOpen className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}
