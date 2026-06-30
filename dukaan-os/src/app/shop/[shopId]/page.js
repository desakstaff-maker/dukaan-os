'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Navbar from '../../../components/Navbar';
import { db } from '../../../lib/firebase';
import { Phone, MessageSquare, Navigation, Calendar, Award, Star, CheckCircle, MapPin, ArrowLeft, Clock } from 'lucide-react';

export default function ShopPage({ params }) {
  const shopId = params.shopId;
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(null);

  const mapRef = useRef(null);
  const leafletInstance = useRef(null);

  // Load shop and product lists with redirect check
  useEffect(() => {
    const s = db.getShop(shopId);
    if (s) {
      if (s.websiteURL) {
        window.location.replace(s.websiteURL);
        return;
      }
      setShop(s);
      setProducts(db.getProductsByShop(shopId));
    }
  }, [shopId]);

  // Leaflet map setup for the specific shop location
  useEffect(() => {
    if (!shop || typeof window === 'undefined' || !window.L || !mapRef.current) return;
    const L = window.L;

    if (leafletInstance.current) {
      leafletInstance.current.remove();
      leafletInstance.current = null;
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([shop.lat, shop.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const color = shop.sponsored ? '#ef4444' : shop.topPartner ? '#5f259f' : '#2563eb';
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    L.marker([shop.lat, shop.lng], { icon: customIcon }).addTo(map).bindPopup(`
      <strong style="font-family:Outfit, sans-serif;">${shop.name}</strong><br/>
      <span style="font-size:11px; font-family:Outfit, sans-serif; color:#666;">${shop.address}</span>
    `).openPopup();

    leafletInstance.current = map;

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [shop]);

  if (!shop) {
    return (
      <>
        <Header />
        <div className="p-8 text-center flex-1">
          <p className="font-extrabold text-sm text-slate-800">Shop website redirecting or loading...</p>
          <Link href="/" className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-primary text-white border-2 border-black rounded-md font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs">
            Back to Home
          </Link>
        </div>
        <Navbar />
      </>
    );
  }

  const categories = ['All', ...new Set(products.map(p => p.category))];
  
  // Filter catalog by search + category
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleReserve = (product) => {
    setSelectedProduct(product);
  };

  const confirmReservation = () => {
    if (!selectedProduct) return;
    
    const user = db.getCurrentUser();
    if (!user || user.role !== 'customer') {
      alert("Please log in as a customer on the Account page first to reserve.");
      return;
    }

    const resData = {
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      shopId: shop.id,
      shopName: shop.name,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      price: selectedProduct.price,
      rewardCoins: selectedProduct.rewardCoins,
    };

    const reservation = db.addReservation(resData);
    setReservationSuccess(reservation);
    setSelectedProduct(null);
  };

  const getUpdatedTimeString = (isoString) => {
    if (!isoString) return "Recently";
    const date = new Date(isoString);
    const diff = new Date() - date;
    const hours = Math.floor(diff / 3600000);
    if (hours <= 0) return `${Math.floor(diff / 60000) || 2} mins ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const waText = `Hello, I reserved ${reservationSuccess?.productName || ''} on your website. My Booking ID is ${reservationSuccess?.code || ''}. I will visit your shop soon to buy.`;
  const waUrl = `https://wa.me/${shop.phone.replace('+', '')}?text=${encodeURIComponent(waText)}`;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`;

  return (
    <>
      <Header />
      
      <main className="p-4 flex-1">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-black text-primary mb-3 hover:underline">
          <ArrowLeft size={14} /> Back to Search
        </Link>

        {/* Shop Profile Banner Hero Card */}
        <div className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-5">
          <img src={shop.banner} alt={shop.name} className="w-full h-28 object-cover border-b-2 border-black" />
          
          <div className="p-3.5">
            {/* Header info */}
            <div className="flex gap-3 items-start mb-2.5">
              <img src={shop.logo} alt="Logo" className="w-12 h-12 rounded-full border-2 border-black object-cover shrink-0" />
              <div>
                <h2 className="text-base font-black leading-tight">{shop.name}</h2>
                <div className="flex gap-1 flex-wrap mt-1">
                  <span className="bg-purple-100 text-purple-800 border border-purple-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">{shop.plan} Plan</span>
                  {shop.topPartner && <span className="bg-blue-100 text-blue-800 border border-blue-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Top Partner</span>}
                  {shop.verified && <span className="bg-emerald-100 text-emerald-800 border border-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Verified</span>}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-semibold mb-3 leading-relaxed">{shop.description}</p>

            {/* Metrics */}
            <div className="grid grid-cols-2 border border-black rounded-md overflow-hidden bg-slate-50 text-xs text-center mb-3">
              <div className="py-2 border-r border-black font-extrabold flex flex-col justify-center">
                <span className="flex items-center justify-center gap-0.5 font-black text-sm">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  {shop.rating}
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Rating</span>
              </div>
              <div className="py-2 font-extrabold flex flex-col justify-center">
                <span className="text-primary font-black text-sm">{shop.monthlyBuyers}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Buyers/Month</span>
              </div>
            </div>

            {/* Address & Timings */}
            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-700 font-bold">
              <div className="flex gap-1.5 items-start">
                <MapPin size={15} className="shrink-0 text-slate-500 mt-0.5" />
                <span>{shop.address}</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <Clock size={15} className="shrink-0 text-slate-500" />
                <span>Open: 9:00 AM - 7:00 PM (All Days)</span>
              </div>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs mt-4">
              <a href={`tel:${shop.phone}`} className="flex items-center justify-center gap-1.5 py-2 bg-white text-black border-2 border-black rounded font-bold hover:bg-slate-50">
                <Phone size={14} /> Call Merchant
              </a>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2 bg-white text-black border-2 border-black rounded font-bold hover:bg-slate-50">
                <Navigation size={14} /> Directions
              </a>
            </div>

          </div>
        </div>

        {/* Map Location pin */}
        <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase mb-2">📍 Store Coordinates Location</h3>
        <div className="map-container h-44 rounded-lg border-2 border-black overflow-hidden mb-5" ref={mapRef}>
          <div className="flex items-center justify-center h-full w-full bg-slate-50 text-center">
            <p className="font-extrabold text-xs text-slate-400">Loading Map Coordinates...</p>
          </div>
        </div>

        {/* Products Catalogue */}
        <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase mb-2.5">📦 Products Catalogue</h3>
        
        {/* Products Search & Category filters */}
        <div className="bg-slate-50 border-2 border-black rounded-lg p-2.5 mb-4 space-y-3">
          <input
            type="text"
            placeholder="Search within this store..."
            className="w-full px-3 py-1.5 border-2 border-black rounded-md outline-none bg-white text-xs font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full border border-black text-[10px] font-extrabold cursor-pointer shrink-0 transition-colors ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-white text-black'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredProducts.length === 0 ? (
            <p className="text-center text-xs text-slate-500 italic py-4">No spares matching search filters in this catalog.</p>
          ) : (
            filteredProducts.map(p => (
              <div key={p.id} className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex gap-3">
                  <img src={p.image} alt={p.name} className="w-14 h-14 rounded border border-black object-cover bg-slate-50" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs leading-tight text-slate-900">{p.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-bold">
                        <span className={p.stockStatus === 'Available' ? 'text-emerald-600' : p.stockStatus === 'Likely Available' ? 'text-amber-600' : 'text-rose-600'}>
                          ● {p.stockStatus}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">Updated {getUpdatedTimeString(p.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="font-black text-sm text-primary">₹{p.price}</span>
                      <span className="bg-yellow-50 text-amber-800 border border-amber-500 text-[8px] font-black px-1 py-0.5 rounded">+{p.rewardCoins} Coins</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  {p.stockStatus !== 'Out of Stock' ? (
                    <button 
                      onClick={() => handleReserve(p)}
                      className="w-full py-1.5 bg-accent text-black border-2 border-black rounded font-black text-xs shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                    >
                      Book Reservation Ticket
                    </button>
                  ) : (
                    <button 
                      className="w-full py-1.5 bg-slate-100 text-slate-400 border border-slate-300 rounded font-bold text-xs cursor-not-allowed"
                      disabled
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reviews Section */}
        <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase mt-6 mb-2">⭐ Shopper Reviews</h3>
        <div className="space-y-2 border-t border-slate-200 pt-2">
          {shop.reviews.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No reviews yet for this merchant.</p>
          ) : (
            shop.reviews.map(r => (
              <div key={r.id} className="text-xs pb-2 border-b border-slate-100">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900">{r.customerName}</span>
                  <span className="flex items-center gap-0.5 text-amber-500">
                    <Star size={12} className="fill-amber-500" /> {r.rating}
                  </span>
                </div>
                <p className="text-slate-600 mt-1 font-medium">{r.comment}</p>
              </div>
            ))
          )}
        </div>

      </main>

      {/* Reservation Confirmation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-[440px] rounded-t-xl border-t-4 border-black p-5 shadow-2xl">
            <h3 className="font-black text-lg mb-1">Confirm Store Reservation</h3>
            <p className="text-xs text-slate-500 mb-4">Reserve item today to guarantee stock. Walk in and pay at store.</p>

            <div className="bg-slate-50 border border-black rounded-lg p-3.5 mb-5 text-sm">
              <p className="font-black text-base">{selectedProduct.name}</p>

              <div className="flex justify-between border-t border-slate-300 mt-3 pt-2.5 font-bold">
                <span>Price to Pay:</span>
                <span className="text-primary text-base font-black">₹{selectedProduct.price}</span>
              </div>
              <div className="flex justify-between mt-1 text-emerald-600 font-extrabold text-xs">
                <span>Earn SuperCoins:</span>
                <span>+{selectedProduct.rewardCoins} Coins</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={confirmReservation}
                className="w-full py-2.5 bg-primary text-white border-2 border-black rounded-md font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                Confirm Booking
              </button>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="w-full py-2.5 bg-white text-black border-2 border-black rounded-md font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Successful Reservation Modal */}
      {reservationSuccess && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-[400px] rounded-xl border-2 border-black p-5 shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full border border-black flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={28} />
            </div>
            <h3 className="font-black text-lg mb-0.5">Reservation Confirmed!</h3>
            <p className="text-xs text-slate-500">Your Booking ID is ready.</p>

            <div className="bg-slate-50 border-2 border-black rounded-lg py-3 px-4 my-4">
              <p className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Reservation ID</p>
              <p className="text-xl font-black text-primary tracking-wide">{reservationSuccess.code}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a 
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 bg-white text-emerald-600 border-2 border-black rounded-md font-extrabold text-xs"
              >
                <MessageSquare size={14} /> WhatsApp Store
              </a>
              <Link 
                href="/customer"
                className="flex items-center justify-center py-2 bg-primary text-white border-2 border-black rounded-md font-black text-xs"
              >
                Done
              </Link>
            </div>
          </div>
        </div>
      )}

      <Navbar />
    </>
  );
}
