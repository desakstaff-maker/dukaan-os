'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import { db, isLiveFirebase, auth } from '../../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Award, Calendar, MessageSquare, LogOut, Phone, User, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  
  // Phone Auth State
  const [phoneInput, setPhoneInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [authConfirmation, setAuthConfirmation] = useState(null);
  
  // Registration State (on first login)
  const [isRegistering, setIsRegistering] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const [resFilter, setResFilter] = useState('all'); // all, reserved, visited, confirmed, cancelled

  useEffect(() => {
    loadUserData();
    
    // Initialize invisible Recaptcha verifier for Firebase Phone Auth
    if (typeof window !== 'undefined' && isLiveFirebase && auth && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          }
        });
      } catch (e) {
        console.error("Recaptcha verifier initialization failed:", e);
      }
    }
  }, []);

  const loadUserData = () => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    if (user && user.role === 'customer') {
      setReservations(db.getReservationsByCustomer(user.id));
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneInput) return;

    try {
      if (isLiveFirebase && auth && window.recaptchaVerifier) {
        const formattedPhone = phoneInput.startsWith('+') ? phoneInput : `+91${phoneInput}`;
        const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
        setAuthConfirmation(confirmationResult);
        setOtpSent(true);
      } else {
        // Setup Phone Auth: fallback mock triggers instantly
        const confirmObj = db.loginWithPhoneMock(phoneInput);
        setAuthConfirmation(confirmObj);
        setOtpSent(true);
      }
    } catch (err) {
      alert("Error sending OTP: " + err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || !authConfirmation) return;

    try {
      if (isLiveFirebase) {
        const result = await authConfirmation.confirm(otpInput);
        const userUid = result.user.uid;
        const userPhone = result.user.phoneNumber;

        // Check if shopper profile exists in Firestore / Local Cache
        const customers = db.getCustomers();
        const matched = customers.find(c => c.id === userUid || c.phone === userPhone);
        
        if (matched) {
          db.setCurrentUser({
            role: 'customer',
            id: matched.id,
            name: matched.name,
            phone: matched.phone,
            superCoins: matched.superCoins || 0,
            joinedAt: matched.joinedAt || new Date().toISOString(),
            totalReservations: matched.totalReservations || 0
          });
          setOtpSent(false);
          setOtpInput('');
          setPhoneInput('');
          loadUserData();
        } else {
          // Triggers first-time registration
          setIsRegistering(true);
        }
      } else {
        const result = await authConfirmation.confirm(otpInput);
        if (result.isNewUser) {
          setIsRegistering(true);
        } else {
          setOtpSent(false);
          setOtpInput('');
          setPhoneInput('');
          loadUserData();
        }
      }
    } catch (err) {
      alert("Verification failed: " + err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nameInput) return;

    try {
      if (isLiveFirebase && auth && auth.currentUser) {
        const userUid = auth.currentUser.uid;
        const phone = auth.currentUser.phoneNumber;

        const newCust = {
          id: userUid,
          name: nameInput,
          phone: phone,
          superCoins: 0,
          totalReservations: 0,
          joinedAt: new Date().toISOString()
        };

        const customers = db.getCustomers();
        customers.push(newCust);
        db.save('customers', customers);

        // Upload to Firestore doc
        const { doc, setDoc } = await import('firebase/firestore');
        const { dbInstance } = await import('../../lib/firebase');
        if (dbInstance) {
          await setDoc(doc(dbInstance, 'customers', userUid), newCust);
        }

        db.setCurrentUser({
          role: 'customer',
          id: newCust.id,
          name: newCust.name,
          phone: newCust.phone,
          superCoins: newCust.superCoins,
          joinedAt: newCust.joinedAt,
          totalReservations: newCust.totalReservations
        });
      } else {
        db.registerMock(nameInput, phoneInput);
      }

      setPhoneInput('');
      setNameInput('');
      setOtpInput('');
      setOtpSent(false);
      setIsRegistering(false);
      loadUserData();
    } catch (err) {
      alert("Registration failed: " + err.message);
    }
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    setReservations([]);
  };

  // Helper status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'reserved':
        return { bg: 'bg-blue-50', border: 'border-blue-500', color: 'text-blue-800', text: 'Reserved' };
      case 'visited':
        return { bg: 'bg-amber-50', border: 'border-amber-500', color: 'text-amber-800', text: 'Visited Store' };
      case 'confirmed':
        return { bg: 'bg-emerald-50', border: 'border-emerald-500', color: 'text-emerald-800', text: 'Confirmed / Claimed' };
      case 'cancelled':
        return { bg: 'bg-rose-50', border: 'border-rose-500', color: 'text-rose-800', text: 'Cancelled' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-500', color: 'text-slate-800', text: 'Unknown' };
    }
  };

  // Filter lists
  const filteredReservations = reservations.filter(r => {
    if (resFilter === 'all') return true;
    return r.status === resFilter;
  });

  // Calculate Reservation Statistics
  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    active: reservations.filter(r => r.status === 'reserved' || r.status === 'visited').length
  };

  return (
    <>
      <Header />
      
      <main className="p-4 flex-1">
        
        {/* Invisible Recaptcha container for Firebase Authentication */}
        <div id="recaptcha-container"></div>

        {currentUser && currentUser.role === 'customer' ? (
          <div>
            
            {/* Customer Profile Banner Card */}
            <div className="bg-primary text-white border-2 border-black rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-black">{currentUser.name}</h2>
                  <p className="text-xs text-purple-200 font-semibold">{currentUser.phone}</p>
                  <p className="text-[10px] text-purple-300 font-bold mt-1">Joined: {new Date(currentUser.joinedAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-[10px] font-black tracking-wider uppercase border border-white/55 px-2 py-1 rounded bg-purple-900/30 hover:bg-purple-900/60"
                >
                  <LogOut size={12} /> Logout
                </button>
              </div>

              {/* SuperCoins Widget */}
              <button 
                onClick={() => router.push('/coins')}
                className="w-full text-left bg-white text-black border-2 border-black rounded-md p-3 mt-4 flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🪙</span>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">SuperCoins Balance</p>
                    <p className="font-black text-primary text-lg leading-tight">{currentUser.superCoins || 0} Coins</p>
                  </div>
                </div>
                <span className="text-xs font-black text-primary flex items-center gap-1">Ledger Details <ArrowRight size={14} /></span>
              </button>
            </div>

            {/* Reservation Statistics Grid */}
            <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase mb-2">📊 Booking Statistics</h3>
            <div className="grid grid-cols-4 gap-2 mb-5 text-center text-xs font-extrabold">
              <div className="bg-slate-50 border border-slate-300 rounded p-1.5">
                <span className="block text-sm font-black text-slate-800">{stats.total}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase block mt-0.5">Total</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-300 rounded p-1.5">
                <span className="block text-sm font-black text-emerald-600">{stats.confirmed}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase block mt-0.5">Done</span>
              </div>
              <div className="bg-blue-50 border border-blue-300 rounded p-1.5">
                <span className="block text-sm font-black text-blue-600">{stats.active}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase block mt-0.5">Active</span>
              </div>
              <div className="bg-rose-50 border border-rose-300 rounded p-1.5">
                <span className="block text-sm font-black text-rose-600">{stats.cancelled}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase block mt-0.5">Cancel</span>
              </div>
            </div>

            {/* Reservations Queue */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase">
                Reservation History ({filteredReservations.length})
              </h3>
              
              <select 
                className="p-1 border border-black rounded text-[11px] font-bold bg-white"
                value={resFilter}
                onChange={(e) => setResFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="reserved">Reserved</option>
                <option value="visited">Visited</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Reservations List */}
            <div className="space-y-4 pb-8">
              {filteredReservations.length === 0 ? (
                <div className="border-2 border-dashed border-black rounded-lg p-8 text-center bg-slate-50">
                  <Calendar className="mx-auto mb-2 text-slate-400" size={32} />
                  <p className="font-extrabold text-sm text-slate-800">No matching reservations</p>
                </div>
              ) : (
                filteredReservations.map(res => {
                  const style = getStatusStyle(res.status);
                  const waMsg = `Hi, I am visiting your store. My reservation Ticket ID is: ${res.id}`;
                  const waUrl = `https://wa.me/${res.shopId}?text=${encodeURIComponent(waMsg)}`;

                  return (
                    <div key={res.id} className="bg-white border-2 border-black rounded-lg p-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Booking ID</span>
                          <p className="font-black text-primary text-base leading-tight">{res.id}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded border text-[10px] font-black ${style.bg} ${style.border} ${style.color}`}>
                          {style.text}
                        </span>
                      </div>

                      <div className="text-sm mb-3">
                        <p className="font-bold">{res.productName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Shop: <strong>{res.shopName}</strong></p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Date: {new Date(res.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded p-2.5 mb-3 text-xs">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Price to Pay</span>
                          <strong className="text-sm font-black text-primary">₹{res.price}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Reward payout</span>
                          <strong className="text-sm font-black text-emerald-600 inline-flex items-center gap-0.5">
                            <Award size={12} fill="currentColor" /> +{res.rewardCoins} Coins
                          </strong>
                        </div>
                      </div>

                      {(res.status === 'reserved' || res.status === 'visited') && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <a 
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-1.5 bg-white text-emerald-600 border-2 border-black rounded font-extrabold"
                          >
                            <MessageSquare size={13} /> WhatsApp
                          </a>
                          <Link 
                            href={`/shop/${res.shopId}`}
                            className="flex items-center justify-center gap-1 py-1.5 bg-primary text-white border-2 border-black rounded font-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                          >
                            View Store
                          </Link>
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

          </div>
        ) : isRegistering ? (
          /* REGISTRATION SCREEN */
          <div className="bg-white border-2 border-black rounded-lg p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black text-center mb-1">Create Account</h2>
            <p className="text-xs text-slate-500 text-center mb-5">Provide details to register your mobile wallet permanently.</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black tracking-wider uppercase text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Duhan"
                  className="form-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-wider uppercase text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  className="form-input bg-slate-100 cursor-not-allowed font-bold"
                  value={phoneInput}
                  disabled
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-primary text-white border-2 border-black rounded-md font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                Create My Account
              </button>
            </form>
          </div>
        ) : (
          /* OTP LOGIN SCREEN */
          <div className="bg-white border-2 border-black rounded-lg p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black text-center mb-1">Shopper Login</h2>
            <p className="text-xs text-slate-500 text-center mb-5">Enter phone number to receive a verification OTP code.</p>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase text-slate-600 mb-1">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. 9466778899"
                      className="form-input pl-9"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      required
                    />
                    <Phone size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-primary text-white border-2 border-black rounded-md font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                >
                  Send OTP Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase text-slate-600 mb-1">Enter 6-Digit OTP Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 123456"
                    className="form-input text-center text-lg tracking-widest font-black"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    required
                  />
                  {!isLiveFirebase && <p className="text-[10px] text-slate-500 mt-1.5 font-bold text-center">Simulated OTP verification. Enter any 4-digit code to proceed.</p>}
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-primary text-white border-2 border-black rounded-md font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                >
                  Verify OTP
                </button>

                <button 
                  type="button" 
                  onClick={() => setOtpSent(false)}
                  className="w-full text-center text-xs font-bold text-slate-500 hover:underline"
                >
                  Change Phone Number
                </button>
              </form>
            )}

            {/* Quick Login Demo Accounts */}
            <div className="mt-6 border-t border-slate-200 pt-5 text-center">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-2">Simulated Accounts</p>
              <button
                onClick={() => {
                  db.login('+919466778899', 'customer');
                  loadUserData();
                }}
                className="w-full py-2 bg-white text-slate-800 border-2 border-black rounded-md font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50"
              >
                <User size={13} /> Login as Rahul Duhan (+919466778899)
              </button>
            </div>

          </div>
        )}

      </main>

      <Navbar />
    </>
  );
}
