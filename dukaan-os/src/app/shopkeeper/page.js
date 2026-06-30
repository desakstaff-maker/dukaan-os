'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import { db } from '../../lib/firebase';
import { IndianRupee, AlertCircle, Plus, Edit, Trash2, Globe, Users, ShoppingBag } from 'lucide-react';

export default function ShopkeeperDashboard() {
  const [activeShop, setActiveShop] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [skSubTab, setSkSubTab] = useState('bookings'); // bookings, inventory, customers
  
  // New Spare Form State
  const [isAddingSpare, setIsAddingSpare] = useState(false);
  const [spareName, setSpareName] = useState('');
  const [sparePrice, setSparePrice] = useState('');
  const [spareStock, setSpareStock] = useState('Available');
  const [spareCategory, setSpareCategory] = useState('Tractor Spares');

  // Edit stock price states
  const [editingProductId, setEditingProductId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('Available');

  useEffect(() => {
    const allShops = db.getShops();
    setShops(allShops);

    const user = db.getCurrentUser();
    let initialShop = allShops[0];
    if (user && user.role === 'shopkeeper' && user.shopId) {
      const matched = allShops.find(s => s.id === user.shopId);
      if (matched) initialShop = matched;
    }
    selectShop(initialShop);
  }, []);

  const selectShop = (shop) => {
    if (!shop) return;
    setActiveShop(shop);
    db.login(shop.owner, 'shopkeeper', shop.id); // Simulates auth session update
    
    // Load lists
    setReservations(db.getReservationsByShop(shop.id));
    setProducts(db.getProductsByShop(shop.id));
  };

  const handleConfirmPurchase = (resId) => {
    db.updateReservationStatus(resId, 'confirmed');
    selectShop(activeShop);
  };

  const handleMarkVisited = (resId) => {
    db.updateReservationStatus(resId, 'visited');
    selectShop(activeShop);
  };

  const handleCancelReservation = (resId) => {
    db.updateReservationStatus(resId, 'cancelled');
    selectShop(activeShop);
  };

  const handleAddSpare = (e) => {
    e.preventDefault();
    if (!spareName || !sparePrice) return;

    const prod = {
      shopId: activeShop.id,
      shopName: activeShop.name,
      name: spareName,
      price: parseFloat(sparePrice),
      stockStatus: spareStock,
      category: spareCategory,
      image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400", // Default tractor spare parts img
      rewardCoins: Math.ceil(sparePrice * 0.01) // 1% rewards rate
    };

    db.addProduct(prod);
    
    // Reset Form
    setSpareName('');
    setSparePrice('');
    setSpareStock('Available');
    setIsAddingSpare(false);
    
    selectShop(activeShop);
  };

  const handleSaveProductEdit = (prodId) => {
    db.updateProduct(prodId, {
      price: parseFloat(editPrice),
      stockStatus: editStock
    });
    setEditingProductId(null);
    selectShop(activeShop);
  };

  const handleDeleteProduct = (prodId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      db.deleteProduct(prodId);
      selectShop(activeShop);
    }
  };

  // Compute stats for current active shop
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const totalSalesVal = confirmedReservations.reduce((sum, r) => sum + r.price, 0);
  
  // Platform Commission details (0.5%)
  const totalCommissionVal = (totalSalesVal * 0.005).toFixed(2);

  // Reservation statistics
  const resStats = {
    reserved: reservations.filter(r => r.status === 'reserved').length,
    visited: reservations.filter(r => r.status === 'visited').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  };

  // Compile Shopkeeper Unique Customer List
  const customerSummary = [];
  confirmedReservations.forEach(r => {
    const matched = customerSummary.find(c => c.phone === r.customerPhone);
    if (matched) {
      matched.purchases += r.price;
      matched.rewards += r.rewardCoins;
    } else {
      customerSummary.push({
        name: r.customerName,
        phone: r.customerPhone,
        purchases: r.price,
        rewards: r.rewardCoins
      });
    }
  });

  return (
    <>
      <Header />
      
      <main className="p-4 flex-1">
        
        {/* Toggle Shops for Testing */}
        <div className="flex gap-2 items-center bg-slate-100 border-2 border-black rounded-lg p-2 mb-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0">Active Store:</span>
          <select 
            className="w-full p-1 border border-black rounded text-xs font-bold bg-white"
            value={activeShop?.id || ''}
            onChange={(e) => {
              const matched = shops.find(s => s.id === e.target.value);
              selectShop(matched);
            }}
          >
            {shops.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.plan} Plan)</option>
            ))}
          </select>
        </div>

        {activeShop && (
          <div>
            
            {/* Shop Website Staging Link */}
            <div className="bg-blue-50 border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4 flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Shop Website Link</span>
                <Link href={`/shop/${activeShop.id}`} className="font-extrabold text-primary flex items-center gap-1 hover:underline">
                  <Globe size={13} /> dukaanos.in/shop/{activeShop.id}
                </Link>
              </div>
              <span className="bg-slate-200 border border-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                {activeShop.plan}
              </span>
            </div>

            {/* Analytics Dashboard Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              
              {/* Sales Card */}
              <div className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-1 text-emerald-600 mb-1">
                  <IndianRupee size={15} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Gross Sales</span>
                </div>
                <p className="text-base font-black text-slate-900">₹{totalSalesVal}</p>
                <span className="text-[8px] text-slate-400 font-bold">From {confirmedReservations.length} deals</span>
              </div>

              {/* Commission Card */}
              <div className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-1 text-rose-600 mb-1">
                  <AlertCircle size={15} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Commission (0.5%)</span>
                </div>
                <p className="text-base font-black text-rose-600">₹{totalCommissionVal}</p>
                <span className="text-[8px] text-slate-400 font-bold">Due to platform</span>
              </div>

            </div>

            {/* Reservation Statistics Breakdown */}
            <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase mb-2">📊 Ticket Statistics</h3>
            <div className="grid grid-cols-4 gap-2 mb-5 text-center text-xs font-extrabold">
              <div className="bg-slate-50 border border-slate-300 rounded p-1.5">
                <span className="block text-sm font-black text-slate-800">{resStats.reserved}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase block mt-0.5">Reserved</span>
              </div>
              <div className="bg-amber-50 border border-amber-300 rounded p-1.5">
                <span className="block text-sm font-black text-amber-600">{resStats.visited}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase block mt-0.5">Visited</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-300 rounded p-1.5">
                <span className="block text-sm font-black text-emerald-600">{resStats.confirmed}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase block mt-0.5">Confirmed</span>
              </div>
              <div className="bg-rose-50 border border-rose-300 rounded p-1.5">
                <span className="block text-sm font-black text-rose-600">{resStats.cancelled}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase block mt-0.5">Cancel</span>
              </div>
            </div>

            {/* Staging Sub-tab selector */}
            <div className="flex border-b-2 border-black mb-4">
              {[
                { id: 'bookings', label: 'Pending Queue', icon: Globe },
                { id: 'inventory', label: 'Spares List', icon: ShoppingBag },
                { id: 'customers', label: 'Shoppers', icon: Users }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = skSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSkSubTab(tab.id)}
                    className={`flex-1 py-2 border-t border-x border-black rounded-t-md text-xs font-black flex items-center justify-center gap-1 ${isActive ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'}`}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB VIEW 1: BOOKINGS QUEUE */}
            {skSubTab === 'bookings' && (
              <div className="space-y-3 pb-8">
                {reservations.filter(r => r.status === 'reserved' || r.status === 'visited').length === 0 ? (
                  <div className="border-2 border-dashed border-black rounded-lg p-6 text-center bg-slate-50 text-xs font-bold text-slate-500">
                    No pending bookings today.
                  </div>
                ) : (
                  reservations.filter(r => r.status === 'reserved' || r.status === 'visited').map(res => (
                    <div key={res.id} className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2 text-xs">
                        <strong>TICKET: {res.id}</strong>
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-black ${res.status === 'visited' ? 'bg-amber-100 text-amber-800 border-amber-800' : 'bg-blue-100 text-blue-800 border-blue-800'}`}>
                          {res.status === 'visited' ? "Visited Store" : "Reserved"}
                        </span>
                      </div>

                      <div className="text-xs mb-3 space-y-1">
                        <p className="font-extrabold text-sm">{res.productName}</p>
                        <p className="text-slate-600">Customer: <strong>{res.customerName}</strong> ({res.customerPhone})</p>
                        <p className="font-extrabold text-primary">Collect Price: ₹{res.price}</p>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button 
                          onClick={() => handleConfirmPurchase(res.id)}
                          className="flex-1 py-1.5 bg-emerald-600 text-white border-2 border-black rounded font-black text-xs shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                        >
                          [CONFIRM PURCHASE]
                        </button>
                        {res.status === 'reserved' && (
                          <button 
                            onClick={() => handleMarkVisited(res.id)}
                            className="px-3 py-1.5 bg-white text-black border-2 border-black rounded font-extrabold text-xs"
                          >
                            Mark Visited
                          </button>
                        )}
                        <button 
                          onClick={() => handleCancelReservation(res.id)}
                          className="py-1.5 bg-rose-600 text-white border-2 border-black rounded font-black text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB VIEW 2: SPARES CATALOG */}
            {skSubTab === 'inventory' && (
              <div className="space-y-3 pb-8">
                <button 
                  onClick={() => setIsAddingSpare(!isAddingSpare)}
                  className="w-full py-2 bg-primary text-white border-2 border-black rounded font-black text-xs mb-2"
                >
                  {isAddingSpare ? "Cancel Add Form" : "+ Add New Product Spare"}
                </button>

                {isAddingSpare && (
                  <form onSubmit={handleAddSpare} className="bg-slate-50 border-2 border-black rounded-lg p-3 space-y-3">
                    <h4 className="font-black text-xs text-slate-800 uppercase">Add Product</h4>
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase mb-0.5">Spare Name</label>
                      <input type="text" className="form-input text-xs p-2" value={spareName} onChange={(e) => setSpareName(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-black text-slate-500 uppercase mb-0.5">Price (₹)</label>
                        <input type="number" className="form-input text-xs p-2" value={sparePrice} onChange={(e) => setSparePrice(e.target.value)} required />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-500 uppercase mb-0.5">Stock Status</label>
                        <select className="form-input text-xs p-2 bg-white" value={spareStock} onChange={(e) => setSpareStock(e.target.value)}>
                          <option value="Available">Available</option>
                          <option value="Likely Available">Likely Available</option>
                          <option value="Out of Stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full py-2 bg-accent text-black border-2 border-black rounded font-black text-xs">Save</button>
                  </form>
                )}

                {products.map(prod => {
                  const isEditing = editingProductId === prod.id;
                  
                  return (
                    <div key={prod.id} className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex gap-3">
                        <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded border border-black object-cover" />
                        <div className="flex-1">
                          <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{prod.name}</h4>
                          <span className="text-[9px] text-slate-400 font-bold">Category: {prod.category}</span>
                          
                          {isEditing ? (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <input type="number" className="form-input text-[11px] p-1" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                              <select className="form-input text-[11px] p-1 bg-white border" value={editStock} onChange={(e) => setEditStock(e.target.value)}>
                                <option value="Available">Available</option>
                                <option value="Likely Available">Likely</option>
                                <option value="Out of Stock">Out of Stock</option>
                              </select>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center mt-1.5">
                              <span className="font-black text-sm text-primary">₹{prod.price}</span>
                              <span className={`text-[10px] font-black ${prod.stockStatus === 'Available' ? 'text-emerald-600' : prod.stockStatus === 'Likely Available' ? 'text-amber-600' : 'text-rose-600'}`}>
                                {prod.stockStatus}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 border-t border-slate-100 mt-2 pt-2 text-xs">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSaveProductEdit(prod.id)} className="bg-emerald-600 text-white border px-2.5 py-1 rounded text-[10px] font-black">Save</button>
                            <button onClick={() => setEditingProductId(null)} className="bg-white border px-2.5 py-1 rounded text-[10px] font-bold">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingProductId(prod.id); setEditPrice(prod.price); setEditStock(prod.stockStatus); }} className="text-blue-600 font-extrabold flex items-center gap-0.5 hover:underline"><Edit size={12} /> Edit</button>
                            <button onClick={() => handleDeleteProduct(prod.id)} className="text-rose-600 font-extrabold flex items-center gap-0.5 hover:underline"><Trash2 size={12} /> Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB VIEW 3: CUSTOMERS ANALYTICS LIST */}
            {skSubTab === 'customers' && (
              <div className="space-y-3 pb-8">
                <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase mb-2">My Customer Network ({customerSummary.length})</h3>
                
                {customerSummary.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 italic py-4">No shopper network recorded yet.</p>
                ) : (
                  customerSummary.map((cust, i) => (
                    <div key={i} className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs flex justify-between items-center">
                      <div>
                        <strong className="text-sm font-extrabold block">{cust.name}</strong>
                        <span className="text-[10px] text-slate-500 font-semibold">{cust.phone}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Generated: 🪙 {cust.rewards} SuperCoins</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Purchases</span>
                        <strong className="font-black text-sm text-primary">₹{cust.purchases}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}

      </main>

      <Navbar />
    </>
  );
}
