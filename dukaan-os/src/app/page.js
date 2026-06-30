'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { db } from '../lib/firebase';
import { Search, MapPin, Phone, MessageSquare, Navigation, Calendar, Award, CheckCircle } from 'lucide-react';

const JIND_LAT = 29.3250;
const JIND_LNG = 76.3150;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userLocation, setUserLocation] = useState({ lat: JIND_LAT, lng: JIND_LNG });
  
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [displayResults, setDisplayResults] = useState([]);
  const [topRecommended, setTopRecommended] = useState([]);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(null);

  // Load and check location
  useEffect(() => {
    setShops(db.getShops());
    setProducts(db.getProducts());

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.log('Location coords fallback', err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Compute Search Results & Recommendation lists
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    // 1. Process Homepage products (Top Partner & Sponsored products) when search query is empty
    const recommendedList = [];
    products.forEach(p => {
      const shop = shops.find(s => s.id === p.shopId);
      if (!shop) return;

      const dist = parseFloat(getDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng));
      
      // Filter out-of-stock items for homepage recommendations
      if (p.stockStatus === 'Out of Stock') return;

      if (shop.topPartner || shop.sponsored) {
        recommendedList.push({
          ...p,
          shop,
          distance: dist,
        });
      }
    });
    // Sort recommendations: Top Partner first, then closest
    recommendedList.sort((a, b) => {
      const aPartner = a.shop.topPartner ? 1 : 0;
      const bPartner = b.shop.topPartner ? 1 : 0;
      if (bPartner !== aPartner) return bPartner - aPartner;
      return a.distance - b.distance;
    });
    setTopRecommended(recommendedList);

    // 2. Process query matches
    const searchMatches = [];
    products.forEach(p => {
      const shop = shops.find(s => s.id === p.shopId);
      if (!shop) return;

      const dist = parseFloat(getDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng));

      // Category match
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return;

      let isMatch = false;
      let nameExact = 0;

      if (!query) {
        isMatch = true;
      } else {
        const prodName = p.name.toLowerCase();
        const shopName = shop.name.toLowerCase();
        if (prodName.includes(query) || shopName.includes(query)) {
          isMatch = true;
          if (prodName === query || prodName.startsWith(query)) {
            nameExact = 1;
          }
        }
      }

      if (isMatch) {
        searchMatches.push({
          ...p,
          shop,
          distance: dist,
          exactMatch: nameExact
        });
      }
    });

    // Sort algorithm:
    // 1. Product match (exactMatch desc)
    // 2. Distance (closest first)
    // 3. Top Partner status
    // 4. Rating
    // 5. Monthly buyers
    searchMatches.sort((a, b) => {
      if (b.exactMatch !== a.exactMatch) return b.exactMatch - a.exactMatch;
      if (a.distance !== b.distance) return a.distance - b.distance;
      
      const aPartner = a.shop.topPartner ? 1 : 0;
      const bPartner = b.shop.topPartner ? 1 : 0;
      if (bPartner !== aPartner) return bPartner - aPartner;

      if (b.shop.rating !== a.shop.rating) return b.shop.rating - a.shop.rating;
      return (b.shop.monthlyBuyers || 0) - (a.shop.monthlyBuyers || 0);
    });

    setDisplayResults(searchMatches);
  }, [searchQuery, selectedCategory, userLocation, shops, products]);

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
      shopId: selectedProduct.shopId,
      shopName: selectedProduct.shopName,
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

  return (
    <>
      <Header />
      
      <main className="p-4 flex-1">
        
        {/* Search Input Box */}
        <div className="bg-white border-2 border-black rounded-lg p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search tractor filter, engine oil..."
                className="w-full pl-9 pr-3 py-2.5 border-2 border-black rounded-md outline-none bg-slate-50 focus:bg-white text-sm font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} className="absolute left-3 top-3.5 text-slate-500" />
            </div>
            <div className="flex items-center gap-1 bg-slate-200 border-2 border-black px-3.5 rounded-md text-xs font-black">
              <MapPin size={14} />
              <span>JIND</span>
            </div>
          </div>

          {/* Quick Filter Categories */}
          <div className="flex gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
            {['All', 'Tractor Spares', 'Lubricants', 'Fertilizer', 'Tools'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full border border-black text-xs font-extrabold cursor-pointer shrink-0 transition-colors ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-white text-black'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display */}
        {searchQuery ? (
          <div>
            <h3 className="text-xs font-black tracking-wider text-slate-500 mb-3 uppercase">
              Search Results ({displayResults.length})
            </h3>
            
            <div className="space-y-4">
              {displayResults.length === 0 ? (
                <div className="border-2 border-dashed border-black rounded-lg p-8 text-center bg-white">
                  <p className="font-extrabold text-sm">No spares found matching your search.</p>
                  <p className="text-xs text-slate-500 mt-1">Try typing "NPK" or "Filter"</p>
                </div>
              ) : (
                displayResults.map(item => (
                  <ProductCard key={item.id} item={item} onReserve={handleReserve} timeHelper={getUpdatedTimeString} />
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Recommendations header */}
            <h3 className="text-xs font-black tracking-wider text-slate-500 mb-3 uppercase">
              ⚡ Recommended Spares (Top Partners)
            </h3>
            
            <div className="space-y-4">
              {topRecommended.map(item => (
                <ProductCard key={item.id} item={item} onReserve={handleReserve} timeHelper={getUpdatedTimeString} />
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Reservation Confirmation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-[440px] rounded-t-xl border-t-4 border-black p-5 shadow-2xl">
            <h3 className="font-black text-lg mb-1">Confirm Store Reservation</h3>
            <p className="text-xs text-slate-500 mb-4">No payment online. Pay cash when collecting at store.</p>

            <div className="bg-slate-50 border border-black rounded-lg p-3.5 mb-5 text-sm">
              <p className="font-black text-base">{selectedProduct.name}</p>
              <p className="text-xs text-slate-600 mt-0.5">Shop: {selectedProduct.shopName}</p>

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

            <div className="bg-yellow-50 border border-black rounded-lg p-3 text-left text-xs mb-4">
              <strong className="block text-amber-800">Instructions:</strong>
              <ol className="list-decimal pl-4 mt-1 space-y-0.5 font-bold text-slate-700">
                <li>Go to {reservationSuccess.shopName}</li>
                <li>Show Ticket ID {reservationSuccess.code}</li>
                <li>Complete purchase to claim your rewards!</li>
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a 
                href={`https://wa.me/${reservationSuccess.shopId}?text=Hi%2C+I+reserved+${encodeURIComponent(reservationSuccess.productName)}+on+Dukaan+OS.+Ticket+ID%3A+${reservationSuccess.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 bg-white text-emerald-600 border-2 border-black rounded-md font-extrabold text-xs"
              >
                <MessageSquare size={14} /> Share on WhatsApp
              </a>
              <button 
                onClick={() => setReservationSuccess(null)}
                className="py-2 bg-primary text-white border-2 border-black rounded-md font-black text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar />
    </>
  );
}

// Sub-component Product Search Result Card
function ProductCard({ item, onReserve, timeHelper }) {
  const waText = `Hello ${item.shop.owner}, is the ${item.name} for ₹${item.price} available in stock today? I found it on Dukaan OS.`;
  const waUrl = `https://wa.me/${item.shop.phone.replace('+', '')}?text=${encodeURIComponent(waText)}`;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.shop.lat},${item.shop.lng}`;

  return (
    <div className="bg-white border-2 border-black rounded-lg p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      
      {/* Shop Header details */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-2 mb-3">
        <div>
          <Link href={`/shop/${item.shopId}`} className="font-extrabold text-sm text-primary flex items-center gap-1 hover:underline">
            {item.shopName}
            {item.shop.topPartner && <span className="bg-blue-100 text-blue-800 text-[9px] font-black border border-blue-800 px-1 rounded uppercase">Top Partner</span>}
          </Link>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{item.shop.address.substring(0, 35)}...</p>
        </div>
        <div className="text-right">
          <span className="bg-slate-100 border border-black text-xs font-black px-1.5 py-0.5 rounded">
            {item.distance} km
          </span>
          <p className="text-[9px] text-slate-500 font-bold mt-1">{item.shop.monthlyBuyers} buyers/mo</p>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex gap-3 mb-3">
        <img src={item.image} alt={item.name} className="w-16 h-16 rounded border border-black object-cover bg-slate-50" />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm leading-tight text-slate-900">{item.name}</h4>
            <div className="flex items-center gap-2 mt-1 text-[10px] font-bold">
              <span className={item.stockStatus === 'Available' ? 'text-emerald-600' : item.stockStatus === 'Likely Available' ? 'text-amber-600' : 'text-rose-600'}>
                ● {item.stockStatus}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">Updated {timeHelper(item.updatedAt)}</span>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <span className="font-black text-base text-primary">₹{item.price}</span>
            <div className="flex items-center gap-0.5 bg-yellow-50 text-amber-800 border border-amber-500 text-[9px] font-extrabold px-1 rounded">
              <Award size={10} className="text-amber-500" />
              <span>+{item.rewardCoins} Coins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Actions Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {item.stockStatus !== 'Out of Stock' ? (
          <button 
            onClick={() => onReserve(item)}
            className="flex items-center justify-center gap-1 py-1.5 bg-accent text-black border-2 border-black rounded font-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            <Calendar size={13} /> Reserve
          </button>
        ) : (
          <button 
            className="py-1.5 bg-slate-100 text-slate-400 border border-slate-300 rounded font-bold cursor-not-allowed"
            disabled
          >
            Out of Stock
          </button>
        )}
        <a 
          href={`tel:${item.shop.phone}`}
          className="flex items-center justify-center gap-1 py-1.5 bg-white text-black border-2 border-black rounded font-bold hover:bg-slate-50"
        >
          <Phone size={13} /> Call Shop
        </a>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
        <a 
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 py-1.5 bg-white text-emerald-600 border-2 border-black rounded font-extrabold"
        >
          <MessageSquare size={13} /> WhatsApp
        </a>
        <a 
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 py-1.5 bg-white text-black border-2 border-black rounded font-bold hover:bg-slate-50"
        >
          <Navigation size={13} /> Directions
        </a>
      </div>

    </div>
  );
}
