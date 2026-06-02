import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-surface-200 mb-4">404</p>
        <h2 className="text-xl font-semibold text-surface-900 mb-2">Page not found</h2>
        <p className="text-surface-500 text-sm mb-8">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <Link href="/" className="btn-primary">Go home</Link>
      </div>
    </div>
  );
}
