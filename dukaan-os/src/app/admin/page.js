'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import { db } from '../../lib/firebase';
import { Store, ShoppingBag, CheckCircle, Users, Coins, TrendingUp, Plus, Edit, Trash2, Key, AlertCircle } from 'lucide-react';

export default function AdminPanel() {
  // Authorization Passcode Gate State
  const [passcode, setPasscode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');

  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('shops'); // shops, products, reservations, customers, plans

  // System Config Plan details
  const [plans, setPlans] = useState({
    Free: 'Raw photos, normal template, basic dashboard',
    Pro: 'Enhanced photos, extra search visibility, analytics',
    Business: 'Professional custom styling, premium photos, dedicated support'
  });

  // Shop Creation form state
  const [isAddingShop, setIsAddingShop] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopSlug, setNewShopSlug] = useState('');
  const [newShopOwner, setNewShopOwner] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [newShopCat, setNewShopCat] = useState('Tractor Spares');
  const [newShopLat, setNewShopLat] = useState('29.3250');
  const [newShopLng, setNewShopLng] = useState('76.3150');
  const [newShopPlan, setNewShopPlan] = useState('Free');
  const [newShopBuyers, setNewShopBuyers] = useState('50');
  const [newShopRating, setNewShopRating] = useState('4.2');
  const [newShopLogo, setNewShopLogo] = useState('');
  const [newShopBanner, setNewShopBanner] = useState('');
  const [newShopWebUrl, setNewShopWebUrl] = useState('');

  // Editing Shop ID state
  const [editingShopId, setEditingShopId] = useState(null);
  const [editShopName, setEditShopName] = useState('');
  const [editShopOwner, setEditShopOwner] = useState('');
  const [editShopPhone, setEditShopPhone] = useState('');
  const [editShopAddress, setEditShopAddress] = useState('');
  const [editShopWebUrl, setEditShopWebUrl] = useState('');

  // SuperCoins addition state
  const [coinTargetCustId, setCoinTargetCustId] = useState('');
  const [coinAmount, setCoinAmount] = useState('');

  // Search/Filter states
  const [searchCustQuery, setSearchCustQuery] = useState('');
  const [searchResQuery, setSearchResQuery] = useState('');
  const [filterResStatus, setFilterResStatus] = useState('all');

  useEffect(() => {
    if (isAuthorized) {
      db.login('admin@dukaanos.in', 'admin');
      loadSystemData();
    }
  }, [isAuthorized]);

  const loadSystemData = () => {
    setShops(db.getShops());
    setProducts(db.getProducts());
    setReservations(db.getReservations());
    setCustomers(db.getCustomers());
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passcode === 'ABHInonu01') {
      setIsAuthorized(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect founder access passcode.');
    }
  };

  // Shops Operations
  const handleToggleShopFlag = (shopId, flagKey) => {
    const shop = db.getShop(shopId);
    if (shop) {
      db.updateShop(shopId, { [flagKey]: !shop[flagKey] });
      loadSystemData();
    }
  };

  const handleUpdateShopPlan = (shopId, plan) => {
    db.updateShop(shopId, { plan });
    loadSystemData();
  };

  const handleUpdateShopBuyers = (shopId, count) => {
    db.updateShop(shopId, { monthlyBuyers: parseInt(count) || 0 });
    loadSystemData();
  };

  const handleUpdateShopRating = (shopId, val) => {
    db.updateShop(shopId, { rating: parseFloat(val) || 0.0 });
    loadSystemData();
  };

  const handleAddShop = (e) => {
    e.preventDefault();
    if (!newShopName || !newShopOwner || !newShopPhone) return;

    const slug = newShopSlug.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || newShopName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const shopData = {
      slug,
      name: newShopName,
      owner: newShopOwner,
      phone: newShopPhone,
      address: newShopAddress || 'Jind, Haryana',
      category: newShopCat,
      lat: parseFloat(newShopLat) || 29.3250,
      lng: parseFloat(newShopLng) || 76.3150,
      plan: newShopPlan,
      monthlyBuyers: parseInt(newShopBuyers) || 0,
      rating: parseFloat(newShopRating) || 4.2,
      logo: newShopLogo || "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&q=80&w=400",
      banner: newShopBanner || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800",
      websiteURL: newShopWebUrl.trim() || null
    };

    db.addShop(shopData);

    // Reset Form
    setNewShopName('');
    setNewShopSlug('');
    setNewShopOwner('');
    setNewShopPhone('');
    setNewShopAddress('');
    setNewShopWebUrl('');
    setIsAddingShop(false);
    loadSystemData();
  };

  const handleDeleteShop = (shopId) => {
    if (confirm("Are you sure you want to delete this shop?")) {
      db.deleteShop(shopId);
      loadSystemData();
    }
  };

  const handleSaveShopEdit = (shopId) => {
    db.updateShop(shopId, {
      name: editShopName,
      owner: editShopOwner,
      phone: editShopPhone,
      address: editShopAddress,
      websiteURL: editShopWebUrl || null
    });
    setEditingShopId(null);
    loadSystemData();
  };

  // Products Operations
  const handleDeleteProduct = (prodId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      db.deleteProduct(prodId);
      loadSystemData();
    }
  };

  // Customers Operations
  const handleToggleCustomerStatus = (custId) => {
    const customersList = db.get('customers');
    const idx = customersList.findIndex(c => c.id === custId);
    if (idx !== -1) {
      customersList[idx].suspended = !customersList[idx].suspended;
      db.save('customers', customersList);
      loadSystemData();
    }
  };

  // SuperCoins Operations
  const handleAdjustCoins = (e, operation) => {
    e.preventDefault();
    if (!coinTargetCustId || !coinAmount) return;

    const amt = parseInt(coinAmount);
    if (isNaN(amt)) return;

    if (operation === 'add') {
      db.addSuperCoinsToCustomer(coinTargetCustId, amt);
    } else {
      db.addSuperCoinsToCustomer(coinTargetCustId, -amt);
    }

    setCoinAmount('');
    loadSystemData();
  };

  // Reservations Operations
  const handleUpdateReservationStatus = (resId, status) => {
    db.updateReservationStatus(resId, status);
    loadSystemData();
  };

  // Shop plans operations
  const handleUpdatePlanDetails = (planKey, details) => {
    setPlans(prev => ({
      ...prev,
      [planKey]: details
    }));
  };

  // Compute System Metrics
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const totalSalesVal = confirmedReservations.reduce((sum, r) => sum + r.price, 0);
  const totalCommissionVal = (totalSalesVal * 0.005).toFixed(2);
  const platformProfitVal = (totalSalesVal * 0.0025).toFixed(2); // 0.25% profit (half of commission)

  // Filtered lists
  const filteredCustomers = customers.filter(c => {
    if (!searchCustQuery.trim()) return true;
    const q = searchCustQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const filteredReservations = reservations.filter(r => {
    if (filterResStatus !== 'all' && r.status !== filterResStatus) return false;
    if (searchResQuery.trim()) {
      const q = searchResQuery.toLowerCase();
      return r.id.toLowerCase().includes(q) || r.productName.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q);
    }
    return true;
  });

  // PASSWORD GATE RENDERING
  if (!isAuthorized) {
    return (
      <>
        <Header />
        <main className="p-6 flex-1 flex flex-col justify-center items-center">
          <div className="bg-white border-2 border-black rounded-lg p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-[360px]">
            <div className="w-10 h-10 rounded-full border border-black flex items-center justify-center bg-yellow-100 text-yellow-800 mx-auto mb-3">
              <Key size={20} />
            </div>
            
            <h2 className="text-base font-black text-center uppercase tracking-tight">Founder Access Gate</h2>
            <p className="text-[10px] text-slate-500 text-center font-bold mb-4">Please input your password key to customize networks.</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter Password"
                  className="form-input text-center font-black tracking-widest text-sm"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                />
              </div>

              {authError && (
                <div className="flex gap-1 items-center text-rose-600 text-[10px] font-black justify-center bg-rose-50 border border-rose-400 p-1.5 rounded">
                  <AlertCircle size={12} /> {authError}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-2 bg-primary text-white border-2 border-black rounded font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                Submit Access Key
              </button>
            </form>
          </div>
        </main>
        <Navbar />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="p-4 flex-1">
        <h2 className="text-lg font-black uppercase text-slate-900 leading-tight">Founder Command Center</h2>
        <p className="text-[10px] text-slate-500 font-bold mb-4">Command center for manual operations, partner ranking boosts, and ledgers.</p>

        {/* Global System Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
          <div className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Network Gross Sales</span>
            <p className="text-base font-black text-emerald-600">₹{totalSalesVal}</p>
            <span className="text-[8px] text-slate-400 font-bold">{confirmedReservations.length} completed bookings</span>
          </div>

          <div className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Platform Profit (0.25%)</span>
            <p className="text-base font-black text-primary">₹{platformProfitVal}</p>
            <span className="text-[8px] text-slate-400 font-bold">Total Commission: ₹{totalCommissionVal}</span>
          </div>

          <div className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Registered Network</span>
            <p className="text-base font-black">{shops.length} Active Shops</p>
            <span className="text-[8px] text-slate-400 font-bold">{products.length} products listed</span>
          </div>

          <div className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Active Customers</span>
            <p className="text-base font-black">{customers.length} Shoppers</p>
            <span className="text-[8px] text-slate-400 font-bold">SuperCoins wallets online</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1 border-b-2 border-black mb-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'shops', label: 'Shops', icon: Store },
            { id: 'products', label: 'Products', icon: ShoppingBag },
            { id: 'reservations', label: 'Bookings', icon: CheckCircle },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'plans', label: 'Plans', icon: TrendingUp },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 border-t border-x border-black rounded-t-md text-xs font-black shrink-0 ${isActive ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'}`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SHOPS CRUD VIEW */}
        {activeTab === 'shops' && (
          <div className="space-y-4">
            
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase">Shops Manager ({shops.length})</h3>
              <button 
                onClick={() => setIsAddingShop(!isAddingShop)}
                className="px-2.5 py-1 bg-primary text-white border-2 border-black rounded font-black text-[10px] shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                {isAddingShop ? "Cancel" : "+ CREATE SHOP"}
              </button>
            </div>

            {/* Create Shop Form */}
            {isAddingShop && (
              <form onSubmit={handleAddShop} className="bg-slate-50 border-2 border-black rounded-lg p-3 space-y-3">
                <h4 className="font-black text-xs text-slate-800 uppercase">Register New Shop</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Shop Name</label>
                    <input type="text" className="form-input text-[11px] p-2" value={newShopName} onChange={(e) => setNewShopName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Website Slug</label>
                    <input type="text" placeholder="e.g. sharmaagro" className="form-input text-[11px] p-2" value={newShopSlug} onChange={(e) => setNewShopSlug(e.target.value)} required />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Owner Name</label>
                    <input type="text" className="form-input text-[11px] p-2" value={newShopOwner} onChange={(e) => setNewShopOwner(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Owner Phone</label>
                    <input type="text" className="form-input text-[11px] p-2" value={newShopPhone} onChange={(e) => setNewShopPhone(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Address</label>
                  <input type="text" className="form-input text-[11px] p-2" value={newShopAddress} onChange={(e) => setNewShopAddress(e.target.value)} required />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Category</label>
                    <select className="form-input text-[11px] p-2 bg-white" value={newShopCat} onChange={(e) => setNewShopCat(e.target.value)}>
                      <option value="Tractor Spares">Tractor Spares</option>
                      <option value="Fertilizer">Fertilizer</option>
                      <option value="Lubricants">Lubricants</option>
                      <option value="Tools">Tools</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Latitude</label>
                    <input type="text" className="form-input text-[11px] p-2" value={newShopLat} onChange={(e) => setNewShopLat(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Longitude</label>
                    <input type="text" className="form-input text-[11px] p-2" value={newShopLng} onChange={(e) => setNewShopLng(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Plan</label>
                    <select className="form-input text-[11px] p-2 bg-white" value={newShopPlan} onChange={(e) => setNewShopPlan(e.target.value)}>
                      <option value="Free">Free</option>
                      <option value="Pro">Pro</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Buyers</label>
                    <input type="number" className="form-input text-[11px] p-2" value={newShopBuyers} onChange={(e) => setNewShopBuyers(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Rating</label>
                    <input type="text" className="form-input text-[11px] p-2" value={newShopRating} onChange={(e) => setNewShopRating(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Logo URL</label>
                    <input type="text" placeholder="https://..." className="form-input text-[11px] p-2" value={newShopLogo} onChange={(e) => setNewShopLogo(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">Banner URL</label>
                    <input type="text" placeholder="https://..." className="form-input text-[11px] p-2" value={newShopBanner} onChange={(e) => setNewShopBanner(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-0.5">External Website URL (Optional)</label>
                  <input type="text" placeholder="e.g. https://sharmaagro.com" className="form-input text-[11px] p-2" value={newShopWebUrl} onChange={(e) => setNewShopWebUrl(e.target.value)} />
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">If configured, shop website redirects will point here.</span>
                </div>

                <button type="submit" className="w-full py-2 bg-accent text-black border-2 border-black rounded font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Save Shop configurations
                </button>
              </form>
            )}

            {/* Shop list */}
            <div className="space-y-3">
              {shops.map(shop => {
                const isEditing = editingShopId === shop.id;

                return (
                  <div key={shop.id} className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    
                    {isEditing ? (
                      <div className="space-y-2 mb-3">
                        <input type="text" className="form-input text-xs" style={{ padding: '6px' }} value={editShopName} onChange={(e) => setEditShopName(e.target.value)} placeholder="Shop Name" />
                        <input type="text" className="form-input text-xs" style={{ padding: '6px' }} value={editShopOwner} onChange={(e) => setEditShopOwner(e.target.value)} placeholder="Owner Name" />
                        <input type="text" className="form-input text-xs" style={{ padding: '6px' }} value={editShopPhone} onChange={(e) => setEditShopPhone(e.target.value)} placeholder="Phone" />
                        <input type="text" className="form-input text-xs" style={{ padding: '6px' }} value={editShopAddress} onChange={(e) => setEditShopAddress(e.target.value)} placeholder="Address" />
                        <input type="text" className="form-input text-xs" style={{ padding: '6px' }} value={editShopWebUrl} onChange={(e) => setEditShopWebUrl(e.target.value)} placeholder="External Web URL (Optional)" />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleSaveShopEdit(shop.id)} className="px-2.5 py-1 bg-emerald-600 text-white border border-black rounded text-[10px] font-black">Save</button>
                          <button onClick={() => setEditingShopId(null)} className="px-2.5 py-1 bg-white border border-black rounded text-[10px] font-bold">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5 mb-2 text-xs">
                          <strong>{shop.name}</strong>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{shop.id}</span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-0.5">
                          <p>Owner: <strong>{shop.owner}</strong> | Phone: {shop.phone}</p>
                          <p>Address: {shop.address}</p>
                          {shop.websiteURL && <p className="text-[10px] text-primary font-bold">Link: {shop.websiteURL}</p>}
                        </div>
                      </>
                    )}

                    {/* Editable configurations */}
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="flex justify-between items-center border border-slate-200 rounded px-1.5 py-1">
                        <span>Plan Tier:</span>
                        <select 
                          className="font-bold p-0.5 border border-black text-[10px] bg-white"
                          value={shop.plan}
                          onChange={(e) => handleUpdateShopPlan(shop.id, e.target.value)}
                        >
                          <option value="Free">Free</option>
                          <option value="Pro">Pro</option>
                          <option value="Business">Business</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center border border-slate-200 rounded px-1.5 py-1">
                        <span>Buyers:</span>
                        <input 
                          type="number" 
                          className="w-12 text-right border border-black font-bold text-[10px] p-0.5" 
                          value={shop.monthlyBuyers || 0} 
                          onChange={(e) => handleUpdateShopBuyers(shop.id, e.target.value)}
                        />
                      </div>

                      <div className="flex justify-between items-center border border-slate-200 rounded px-1.5 py-1">
                        <span>Rating:</span>
                        <input 
                          type="number" 
                          step="0.1" 
                          max="5.0"
                          className="w-12 text-right border border-black font-bold text-[10px] p-0.5" 
                          value={shop.rating || 0.0} 
                          onChange={(e) => handleUpdateShopRating(shop.id, e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Visibility Checkbox flags */}
                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 mt-2.5 pt-2 text-[10px] font-bold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={shop.sponsored || false} onChange={() => handleToggleShopFlag(shop.id, 'sponsored')} />
                        <span>Sponsored Ad</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={shop.topPartner || false} onChange={() => handleToggleShopFlag(shop.id, 'topPartner')} />
                        <span>Top Partner</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={shop.verified || false} onChange={() => handleToggleShopFlag(shop.id, 'verified')} />
                        <span>Verified Coordinates</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={shop.featured || false} onChange={() => handleToggleShopFlag(shop.id, 'featured')} />
                        <span>Home Featured</span>
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 border-t border-slate-100 mt-2 pt-1.5 text-xs">
                      {!isEditing && (
                        <button 
                          onClick={() => {
                            setEditingShopId(shop.id);
                            setEditShopName(shop.name);
                            setEditShopOwner(shop.owner);
                            setEditShopPhone(shop.phone);
                            setEditShopAddress(shop.address);
                            setEditShopWebUrl(shop.websiteURL || '');
                          }}
                          className="text-blue-600 font-black flex items-center gap-0.5 hover:underline"
                        >
                          <Edit size={12} /> Edit
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteShop(shop.id)}
                        className="text-rose-600 font-black flex items-center gap-0.5 hover:underline"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* PRODUCTS CRUD VIEW */}
        {activeTab === 'products' && (
          <div className="space-y-2">
            <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase mb-3">All Products ({products.length})</h3>
            
            {products.map(prod => (
              <div key={prod.id} className="bg-white border-2 border-black rounded-lg p-3 flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{prod.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Shop: {prod.shopName} | Cat: {prod.category}</p>
                  <p className="font-black text-sm text-primary mt-1">₹{prod.price} <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-1 border border-slate-300 rounded ml-1.5">{prod.stockStatus}</span></p>
                </div>
                <button 
                  onClick={() => handleDeleteProduct(prod.id)}
                  className="text-rose-600 p-1.5 hover:bg-rose-50 rounded"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* RESERVATIONS MANAGER */}
        {activeTab === 'reservations' && (
          <div className="space-y-3">
            <div className="flex gap-2 items-center bg-slate-100 border-2 border-black rounded-lg p-2.5 mb-2">
              <input
                type="text"
                placeholder="Search ticket code, customer..."
                className="w-full px-2 py-1.5 border border-black rounded text-xs font-bold"
                value={searchResQuery}
                onChange={(e) => setSearchResQuery(e.target.value)}
              />
              <select
                className="p-1 border border-black rounded text-[11px] font-bold bg-white"
                value={filterResStatus}
                onChange={(e) => setFilterResStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="reserved">Reserved</option>
                <option value="visited">Visited</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase mb-2">Reservations Queue ({filteredReservations.length})</h3>
            
            {filteredReservations.map(res => (
              <div key={res.id} className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 mb-2 font-bold">
                  <span className="text-primary">{res.id}</span>
                  <span className="uppercase text-slate-500">{res.status}</span>
                </div>
                <p className="font-extrabold">{res.productName}</p>
                <p className="text-slate-600 mt-0.5">Shop: {res.shopName} | Buyer: {res.customerName}</p>
                <p className="font-extrabold mt-1 text-slate-800">Value: ₹{res.price} | Reward: {res.rewardCoins} coins | Commission: ₹{(res.price * 0.005).toFixed(2)}</p>
                
                {/* Manual Status Override buttons */}
                <div className="flex gap-1.5 mt-3 pt-2 border-t border-slate-100 text-[10px] font-black">
                  <button onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')} className="px-2 py-1 bg-emerald-600 text-white rounded border border-black uppercase">Confirm</button>
                  <button onClick={() => handleUpdateReservationStatus(res.id, 'visited')} className="px-2 py-1 bg-amber-500 text-black rounded border border-black uppercase">Visited</button>
                  <button onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')} className="px-2 py-1 bg-rose-600 text-white rounded border border-black uppercase">Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CUSTOMERS MANAGER */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            
            {/* Search Customers */}
            <input
              type="text"
              placeholder="Search shoppers by name or phone..."
              className="w-full px-3 py-2 border-2 border-black rounded-lg bg-slate-50 font-bold text-xs outline-none"
              value={searchCustQuery}
              onChange={(e) => setSearchCustQuery(e.target.value)}
            />

            {/* SuperCoins Adjustment Form */}
            <form onSubmit={(e) => handleAdjustCoins(e, 'add')} className="bg-slate-50 border-2 border-black rounded-lg p-3 space-y-3">
              <h4 className="font-black text-xs text-slate-800 uppercase flex items-center gap-1"><Coins size={14} className="text-amber-500" /> SuperCoins Modifier</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-0.5">Select Customer</label>
                  <select 
                    className="form-input text-[11px] p-2 bg-white border border-black" 
                    value={coinTargetCustId}
                    onChange={(e) => setCoinTargetCustId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-0.5">Coins Amount</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 50" 
                    className="form-input text-[11px]" 
                    style={{ padding: '6px' }}
                    value={coinAmount}
                    onChange={(e) => setCoinAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="submit" className="py-1.5 bg-emerald-600 text-white border border-black rounded font-black text-xs">Add Coins</button>
                <button type="button" onClick={(e) => handleAdjustCoins(e, 'remove')} className="py-1.5 bg-rose-600 text-white border border-black rounded font-black text-xs">Remove Coins</button>
              </div>
            </form>

            <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase">Customers list ({filteredCustomers.length})</h3>

            <div className="space-y-2">
              {filteredCustomers.map(cust => (
                <div key={cust.id} className="bg-white border-2 border-black rounded-lg p-3 flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs">
                  <div>
                    <h4 className="font-extrabold text-slate-900 leading-tight">
                      {cust.name} 
                      {cust.suspended && <span className="bg-red-100 text-red-800 text-[8px] font-black px-1.5 py-0.5 rounded border border-red-800 uppercase ml-1">Suspended</span>}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{cust.phone}</p>
                    <p className="text-[8.5px] text-slate-400 font-bold">Joined: {new Date(cust.joinedAt || Date.now()).toLocaleDateString()} | Bookings: {cust.totalReservations || 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-800 bg-yellow-50 border border-amber-500 rounded-full px-2 py-0.5">{cust.superCoins || 0} Coins</span>
                    <button 
                      onClick={() => handleToggleCustomerStatus(cust.id)} 
                      className={`px-2 py-1 text-[10px] border border-black rounded font-black uppercase ${cust.suspended ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'}`}
                    >
                      {cust.suspended ? "Activate" : "Suspend"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* SHOP PLANS CONFIGS */}
        {activeTab === 'plans' && (
          <div className="bg-white border-2 border-black rounded-lg p-4 space-y-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase border-b border-slate-200 pb-2 mb-2">Shop Plan Settings</h3>
            
            {Object.keys(plans).map(planKey => (
              <div key={planKey} className="space-y-1">
                <label className="block font-black text-xs text-primary uppercase">{planKey} Plan Features</label>
                <textarea
                  className="form-input text-xs min-h-[60px]"
                  style={{ padding: '8px' }}
                  value={plans[planKey]}
                  onChange={(e) => handleUpdatePlanDetails(planKey, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

      </main>

      <Navbar />
    </>
  );
}
