'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  function isActive(path) {
    return pathname.startsWith(path);
  }

  function handleLogout() {
    localStorage.clear();
    window.location.href = '/';
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', emoji: '🏠' },
    { href: '/dependents', label: 'Dependentes', emoji: '👨‍👩‍👧' },
  ];

  return (
    <>
      {/* Desktop: top bar */}
      <header className="hidden sm:block bg-blue-600 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            💙 Luccare
          </Link>

          <nav className="flex gap-2 text-sm font-semibold items-center">
            {links.map(({ href, label, emoji }) => (
              <Link
                key={href}
                href={href}
                className={`
                  px-3 py-1 rounded-lg transition
                  ${isActive(href)
                    ? 'bg-white text-blue-700 font-semibold'
                    : 'text-white hover:bg-blue-500'}
                `}
              >
                {emoji} {label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-1 rounded-lg text-white hover:bg-red-400 transition"
            >
              🚪 Sair
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile: bottom bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-16">
          {links.map(({ href, label, emoji }) => (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center justify-center flex-1 h-full transition
                ${isActive(href)
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-500'}
              `}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-xs mt-0.5">{label}</span>
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 transition"
          >
            <span className="text-xl">🚪</span>
            <span className="text-xs mt-0.5">Sair</span>
          </button>
        </div>
      </nav>
    </>
  );
}
