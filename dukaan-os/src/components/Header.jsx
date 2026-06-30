'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase';

export default function Header() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Sync current session state dynamically
    const interval = setInterval(() => {
      const user = db.getCurrentUser();
      if (user && JSON.stringify(user) !== JSON.stringify(currentUser)) {
        setCurrentUser(user);
      } else if (!user && currentUser !== null) {
        setCurrentUser(null);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleCoinsClick = () => {
    router.push('/coins');
  };

  return (
    <header className="sticky top-0 bg-primary text-white px-4 py-3 border-b-2 border-black flex justify-between items-center z-50">
      <Link href="/" className="font-extrabold text-lg tracking-tight flex items-center gap-1">
        DUKAAN OS <span className="bg-accent text-black text-[9px] font-black px-1.5 py-0.5 rounded border border-black">MVP</span>
      </Link>
      
      <div className="flex items-center gap-2">
        {currentUser && currentUser.role === 'customer' && (
          <button 
            onClick={handleCoinsClick}
            className="flex items-center gap-1.5 bg-white text-black px-2.5 py-1 rounded-full text-xs font-black border border-black hover:bg-slate-100 transition-colors"
          >
            <span>🪙</span>
            <span>{currentUser.superCoins || 0}</span>
          </button>
        )}

        {currentUser && currentUser.role === 'shopkeeper' && (
          <span className="bg-accent text-black text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase">
            Merchant
          </span>
        )}

        {currentUser && currentUser.role === 'admin' && (
          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase">
            Founder
          </span>
        )}
      </div>
    </header>
  );
}
