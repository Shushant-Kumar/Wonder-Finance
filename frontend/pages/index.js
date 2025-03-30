import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Welcome to Wonder Finance</h1>
      <p className="text-lg mb-4 text-center">Manage your finances smartly with AI-powered insights.</p>
      <Link href="/dashboard" aria-label="Go to Dashboard">
        <a className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg">
          Go to Dashboard
        </a>
      </Link>
    </div>
  );
}
