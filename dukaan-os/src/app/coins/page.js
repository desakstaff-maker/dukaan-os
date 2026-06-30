'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import { db } from '../../lib/firebase';
import { Award, ArrowLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function CoinsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const user = db.getCurrentUser();
    setCurrentUser(user);

    if (user && user.role === 'customer') {
      setReservations(db.getReservationsByCustomer(user.id));
    }
  }, []);

  if (!currentUser || currentUser.role !== 'customer') {
    return (
      <>
        <Header />
        <main className="p-6 text-center flex-1">
          <p className="font-extrabold text-sm text-slate-800">Please login on the Account tab first.</p>
          <Link href="/customer" className="inline-flex mt-4 px-4 py-2 bg-primary text-white border-2 border-black rounded-md font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs">
            Go to Login
          </Link>
        </main>
        <Navbar />
      </>
    );
  }

  // Calculate totals
  const earnedReservations = reservations.filter(r => r.status === 'confirmed');
  const totalLifetimeEarned = earnedReservations.reduce((sum, r) => sum + r.rewardCoins, 0);
  
  // Seed some mock transactions to showcase spent/rewards lists
  const mockSpentHistory = [
    { id: 's1', label: 'Discount discount at Gupta Store', amount: 15, date: '2026-06-28T10:00:00Z' }
  ];
  const totalLifetimeSpent = mockSpentHistory.reduce((sum, s) => sum + s.amount, 0);

  return (
    <>
      <Header />
      
      <main className="p-4 flex-1">
        
        {/* Back Link */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1 font-black text-xs text-primary mb-4 hover:underline"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* SuperCoins Header Summary Card */}
        <div className="bg-primary text-white border-2 border-black rounded-lg p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-5">
          <p className="text-[10px] uppercase font-black tracking-wider text-purple-200">Current Balance</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl">🪙</span>
            <span className="text-3xl font-black">{currentUser.superCoins || 0} SuperCoins</span>
          </div>
          
          {/* Lifetime details */}
          <div className="grid grid-cols-2 border-t border-purple-800/80 mt-4 pt-3.5 text-xs">
            <div>
              <span className="text-[10px] text-purple-200 font-bold block uppercase">Lifetime Earned</span>
              <span className="font-extrabold text-base">🪙 {totalLifetimeEarned + 15}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-purple-200 font-bold block uppercase">Lifetime Spent</span>
              <span className="font-extrabold text-base">🪙 {totalLifetimeSpent}</span>
            </div>
          </div>
        </div>

        <h3 className="font-black text-xs text-slate-500 uppercase tracking-wider mb-3">SuperCoin Transaction Ledger</h3>
        
        <div className="space-y-3 pb-8">
          {/* Earned via Reservations List */}
          {earnedReservations.map(r => (
            <div key={r.id} className="bg-white border-2 border-black rounded-lg p-3.5 flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <span className="p-0.5 bg-emerald-100 rounded border border-emerald-600"><ArrowUpRight size={10} /></span>
                  <strong className="text-xs font-black">Reservation Reward</strong>
                </div>
                <p className="text-[10px] text-slate-500 font-bold mt-1.5">Ticket ID: {r.id} | Shop: {r.shopName}</p>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="text-emerald-600 font-black text-sm">+{r.rewardCoins} Coins</span>
            </div>
          ))}

          {/* Spent History */}
          {mockSpentHistory.map(item => (
            <div key={item.id} className="bg-white border-2 border-black rounded-lg p-3.5 flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <div className="flex items-center gap-1.5 text-rose-600">
                  <span className="p-0.5 bg-rose-100 rounded border border-rose-600"><ArrowDownRight size={10} /></span>
                  <strong className="text-xs font-black">Discount Claimed</strong>
                </div>
                <p className="text-[10px] text-slate-500 font-bold mt-1.5">{item.label}</p>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">{new Date(item.date).toLocaleDateString()}</p>
              </div>
              <span className="text-rose-600 font-black text-sm">-{item.amount} Coins</span>
            </div>
          ))}

          {earnedReservations.length === 0 && (
            <p className="text-center text-xs text-slate-500 italic py-6">No coin rewards earned yet. Reserve and complete purchases to gain coins!</p>
          )}
        </div>

      </main>

      <Navbar />
    </>
  );
}
