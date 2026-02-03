'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  function navClass(path) {
    const active = pathname.startsWith(path);

    return `
      px-3 py-1 rounded-lg transition
      ${active
        ? 'bg-white text-blue-700 font-semibold'
        : 'text-white hover:bg-blue-500'}
    `;
  }

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

        <Link href="/dashboard" className="font-bold text-lg">
          💙 Luccare
        </Link>

        <nav className="flex gap-2 text-sm font-semibold">
          <Link href="/dashboard" className={navClass('/dashboard')}>
            🏠 Dashboard
          </Link>

          <Link href="/dependents" className={navClass('/dependents')}>
            👨‍👩‍👧 Dependentes
          </Link>
        </nav>
      </div>
    </header>
  );
}
