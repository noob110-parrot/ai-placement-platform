"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-8 font-sans">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-3">Something went wrong</h1>
          <p className="text-[#94a3b8] text-sm mb-2 leading-relaxed">
            {error.message || "An unexpected application error occurred."}
          </p>
          {error.digest && (
            <p className="text-[#475569] text-xs font-mono mb-6">
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-semibold rounded-xl transition-colors">
            <RefreshCw size={15} /> Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
