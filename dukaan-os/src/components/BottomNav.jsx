'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Briefcase, Settings } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Search', path: '/', icon: Search },
    { label: 'My Coins', path: '/customer', icon: User },
    { label: 'Shop Dashboard', path: '/shopkeeper', icon: Briefcase },
    { label: 'Admin', path: '/admin', icon: Settings },
  ];

  return (
    <nav className="nav-bar">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
        return (
          <Link key={item.path} href={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
