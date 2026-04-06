"use client";

import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BooksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50dvh] p-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <BookOpen className="w-7 h-7 text-destructive" />
      </div>
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-5 max-w-sm">
        {error.message || "Failed to load books. Please try again."}
      </p>
      <Button onClick={reset} className="bg-navy-gradient text-white">
        Try again
      </Button>
    </div>
  );
}
