import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-DEFAULT flex flex-col items-center justify-center text-center px-4">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="relative z-10">
        <p className="text-8xl font-extrabold text-gradient mb-4 leading-none">404</p>
        <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-text-muted mb-8 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors text-sm">
            Go to Dashboard
          </Link>
          <Link href="/"
            className="px-6 py-3 border border-surface-border text-text-muted hover:text-white rounded-xl transition-colors text-sm">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
