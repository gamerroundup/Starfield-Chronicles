'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, BookOpen, User, ShieldAlert, Award } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Daily Slate', href: '/', icon: Compass },
    { name: 'Chronicles', href: '/chronicles', icon: BookOpen },
    { name: 'New Captain', href: '/character/new', icon: User },
    { name: 'Creator Hub', href: '/creator', icon: Award },
    { name: 'Admin', href: '/admin', icon: ShieldAlert },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 flex items-center justify-center rounded-full border border-constellation-cyan shadow-glow-cyan overflow-hidden bg-space-950">
            {/* Constellation color stripe logo */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-80 rotate-45 transform scale-125">
              <div className="h-2 bg-constellation-orange w-full"></div>
              <div className="h-2 bg-constellation-yellow w-full"></div>
              <div className="h-2 bg-constellation-cyan w-full"></div>
              <div className="h-2 bg-constellation-violet w-full"></div>
            </div>
          </div>
          <div>
            <span className="font-bold tracking-widest text-slate-100 text-lg uppercase group-hover:text-constellation-cyan transition-colors">
              Starfield
            </span>
            <span className="text-xs text-slate-400 block tracking-widest uppercase font-semibold">
              Chronicles
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 md:gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs md:text-sm font-semibold tracking-wider uppercase transition-all duration-300 border ${
                  isActive
                    ? 'border-constellation-cyan text-constellation-cyan bg-constellation-cyan/10 shadow-glow-cyan'
                    : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
