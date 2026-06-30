'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Map, Briefcase, Settings } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', path: '/', icon: Search },
    { label: 'Explore Map', path: '/map', icon: Map },
    { label: 'Account', path: '/customer', icon: User },
  ];

  const adminItems = [
    { label: 'Dukaan Board', path: '/shopkeeper', icon: Briefcase },
    { label: 'Admin', path: '/admin', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-50 transform -translate-x-0 w-full max-w-[480px] bg-white border-t-2 border-black grid grid-cols-5 py-2 z-50 shadow-md">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        return (
          <Link key={item.path} href={item.path} className={`flex flex-col items-center justify-center text-[10px] font-bold ${isActive ? 'text-primary' : 'text-slate-500'}`}>
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      
      {/* Simulation Shortcuts */}
      {adminItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
        return (
          <Link key={item.path} href={item.path} className={`flex flex-col items-center justify-center text-[10px] font-bold ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
