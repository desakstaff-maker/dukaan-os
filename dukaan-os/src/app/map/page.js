'use client';

import React, { useEffect, useState, useRef } from 'react';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import { db } from '../../lib/firebase';
import { MapPin, Navigation } from 'lucide-react';

const JIND_LAT = 29.3250;
const JIND_LNG = 76.3150;

export default function ExploreMapPage() {
  const [shops, setShops] = useState([]);
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);

  useEffect(() => {
    setShops(db.getShops());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.L || !mapRef.current || shops.length === 0) return;
    const L = window.L;

    // Destory existing map instance to avoid re-init error
    if (leafletInstance.current) {
      leafletInstance.current.remove();
      leafletInstance.current = null;
    }

    // Set view centered on Jind
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([JIND_LAT, JIND_LNG], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add Shop Markers
    shops.forEach(shop => {
      const color = shop.sponsored ? '#ef4444' : shop.topPartner ? '#5f259f' : '#2563eb';
      
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([shop.lat, shop.lng], { icon: customIcon }).addTo(map);
      
      const gMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`;

      marker.bindPopup(`
        <div style="font-family: Outfit, sans-serif; font-size: 13px; line-height: 1.4; width: 160px;">
          <h4 style="margin: 0 0 4px; font-weight: 800; color:#5f259f;">${shop.name}</h4>
          <p style="margin: 0 0 6px; color: #555; font-size:11px;">${shop.address.substring(0, 45)}...</p>
          <div style="display: flex; gap: 4px; margin-bottom: 8px;">
            ${shop.topPartner ? '<span style="background:#e0f2fe; color:#0369a1; padding:1px 4px; font-size:9px; font-weight:bold; border-radius:2px; border:1px solid #0369a1;">Top Partner</span>' : ''}
            <span style="background:#f1f5f9; color:#334155; padding:1px 4px; font-size:9px; font-weight:bold; border-radius:2px; border:1px solid #334155;">${shop.plan} Plan</span>
          </div>
          <a href="/shop/${shop.id}" style="display:block; text-align:center; background:#5f259f; color:white; padding:4px 8px; font-weight:bold; text-decoration:none; border-radius:4px; font-size:11px; margin-bottom:4px; border:1px solid black;">View Website</a>
          <a href="${gMapsDirUrl}" target="_blank" rel="noopener noreferrer" style="display:block; text-align:center; background:#ff9900; color:black; padding:4px 8px; font-weight:bold; text-decoration:none; border-radius:4px; font-size:11px; border:1px solid black;">Get Directions</a>
        </div>
      `);
    });

    leafletInstance.current = map;

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [shops]);

  return (
    <>
      <Header />
      
      <main className="flex-1 flex flex-col relative h-[calc(100vh-108px)]">
        
        {/* Fullscreen Map Panel */}
        <div className="flex-1 w-full h-full relative z-10" ref={mapRef}>
          <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 p-6 text-center">
            <MapPin size={36} className="text-primary animate-bounce mb-2" />
            <p className="font-extrabold text-sm text-slate-800">Loading Hyperlocal Map...</p>
            <p className="text-[10px] text-slate-500 mt-1 font-bold">Connecting Leaflet & OpenStreetMap</p>
          </div>
        </div>

        {/* Legend float badge */}
        <div className="absolute top-4 left-4 z-20 bg-white border-2 border-black rounded-lg p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[11px] font-bold space-y-1.5 pointer-events-none">
          <p className="font-black text-slate-500 uppercase text-[9px] tracking-wider mb-1">Active Network</p>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary border border-white"></span>
            <span>Top Partner Shops</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white"></span>
            <span>Standard Shops</span>
          </div>
        </div>

      </main>

      <Navbar />
    </>
  );
}
