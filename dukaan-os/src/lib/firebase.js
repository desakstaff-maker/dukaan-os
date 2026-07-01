import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, deleteDoc, getDocs, getDoc, collection 
} from 'firebase/firestore';

// Check if Firebase env vars exist
const isFirebaseConfigured = !!(
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

let auth = null;
let firestore = null;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
    console.log('[DukaanOS] Firebase LIVE mode active. Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  } catch (err) {
    console.error('[DukaanOS] Firebase init error:', err);
  }
}

// =============================================================================
// DATABASE MANAGER
// 
// DESIGN:
// - When Firebase IS configured → ALL reads come from Firestore, ALL writes go 
//   to Firestore. localStorage is only a read-through cache.
// - When Firebase is NOT configured → Pure localStorage (offline dev mode).
// - Session methods (getCurrentUser/setCurrentUser/logout) are always localStorage
//   since they are per-browser session state.
// =============================================================================

class Database {

  // ---------- localStorage helpers ----------
  _local(key) {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('dos_' + key) || '[]');
  }
  _saveLocal(key, val) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dos_' + key, JSON.stringify(val));
  }

  // ======================= SHOPS =======================

  async getShops() {
    if (firestore) {
      try {
        const snap = await getDocs(collection(firestore, 'shops'));
        const data = [];
        snap.forEach(d => data.push({ id: d.id, ...d.data() }));
        this._saveLocal('shops', data);
        return data;
      } catch (e) {
        console.warn('[DB] Firestore getShops failed, using cache:', e);
      }
    }
    return this._local('shops');
  }

  async getShop(id) {
    if (firestore) {
      try {
        const snap = await getDoc(doc(firestore, 'shops', id));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() };
        }
        return null;
      } catch (e) {
        console.warn('[DB] Firestore getShop failed:', e);
      }
    }
    return this._local('shops').find(s => s.id === id) || null;
  }

  async addShop(shopData) {
    const id = (shopData.slug || shopData.name.toLowerCase().replace(/[^a-z0-9]/g, '')).trim();
    const newShop = {
      id,
      name: shopData.name,
      slug: id,
      owner: shopData.owner,
      phone: shopData.phone,
      address: shopData.address || 'Jind, Haryana',
      category: shopData.category || 'Tractor Spares',
      lat: parseFloat(shopData.lat) || 29.3250,
      lng: parseFloat(shopData.lng) || 76.3150,
      plan: shopData.plan || 'Free',
      rating: parseFloat(shopData.rating) || 4.0,
      monthlyBuyers: parseInt(shopData.monthlyBuyers) || 0,
      sponsored: shopData.sponsored || false,
      topPartner: shopData.topPartner || false,
      verified: shopData.verified !== undefined ? shopData.verified : true,
      featured: shopData.featured || false,
      reviews: shopData.reviews || [],
      description: shopData.description || 'Quality products and services.',
      banner: shopData.banner || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800',
      logo: shopData.logo || 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&q=80&w=400',
      websiteURL: shopData.websiteURL || null,
    };

    if (firestore) {
      try {
        await setDoc(doc(firestore, 'shops', id), newShop);
      } catch (e) { console.error('[DB] Firestore addShop failed:', e); }
    }

    const shops = this._local('shops');
    const idx = shops.findIndex(s => s.id === id);
    if (idx >= 0) shops[idx] = newShop; else shops.push(newShop);
    this._saveLocal('shops', shops);
    return newShop;
  }

  async updateShop(id, updatedData) {
    let current = null;

    if (firestore) {
      try {
        const snap = await getDoc(doc(firestore, 'shops', id));
        if (snap.exists()) {
          current = { id: snap.id, ...snap.data(), ...updatedData };
          await setDoc(doc(firestore, 'shops', id), current);
        }
      } catch (e) { console.error('[DB] Firestore updateShop failed:', e); }
    }

    const shops = this._local('shops');
    const index = shops.findIndex(s => s.id === id);
    if (index !== -1) {
      shops[index] = { ...shops[index], ...updatedData };
      current = shops[index];
      this._saveLocal('shops', shops);
    }
    return current;
  }

  async deleteShop(id) {
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, 'shops', id));
        // Also delete all products belonging to this shop
        const prodSnap = await getDocs(collection(firestore, 'products'));
        const batch = [];
        prodSnap.forEach(d => {
          if (d.data().shopId === id) batch.push(deleteDoc(doc(firestore, 'products', d.id)));
        });
        await Promise.all(batch);
      } catch (e) { console.error('[DB] Firestore deleteShop failed:', e); }
    }

    this._saveLocal('shops', this._local('shops').filter(s => s.id !== id));
    this._saveLocal('products', this._local('products').filter(p => p.shopId !== id));
    return true;
  }

  // ======================= PRODUCTS =======================

  async getProducts() {
    if (firestore) {
      try {
        const snap = await getDocs(collection(firestore, 'products'));
        const data = [];
        snap.forEach(d => data.push({ id: d.id, ...d.data() }));
        this._saveLocal('products', data);
        return data;
      } catch (e) {
        console.warn('[DB] Firestore getProducts failed:', e);
      }
    }
    return this._local('products');
  }

  async getProductsByShop(shopId) {
    const all = await this.getProducts();
    return all.filter(p => p.shopId === shopId);
  }

  async addProduct(product) {
    const id = 'p_' + Date.now();
    const newProduct = {
      id,
      ...product,
      rewardCoins: product.rewardCoins || Math.ceil((product.price || 0) * 0.01),
      updatedAt: new Date().toISOString(),
    };

    if (firestore) {
      try {
        await setDoc(doc(firestore, 'products', id), newProduct);
      } catch (e) { console.error('[DB] Firestore addProduct failed:', e); }
    }

    const products = this._local('products');
    products.push(newProduct);
    this._saveLocal('products', products);
    return newProduct;
  }

  async updateProduct(id, updatedData) {
    const updated = { ...updatedData, updatedAt: new Date().toISOString() };

    if (firestore) {
      try {
        const snap = await getDoc(doc(firestore, 'products', id));
        if (snap.exists()) {
          const merged = { id, ...snap.data(), ...updated };
          await setDoc(doc(firestore, 'products', id), merged);
        }
      } catch (e) { console.error('[DB] Firestore updateProduct failed:', e); }
    }

    const products = this._local('products');
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updated };
      this._saveLocal('products', products);
      return products[index];
    }
    return null;
  }

  async deleteProduct(id) {
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, 'products', id));
      } catch (e) { console.error('[DB] Firestore deleteProduct failed:', e); }
    }

    this._saveLocal('products', this._local('products').filter(p => p.id !== id));
    return true;
  }

  // ======================= RESERVATIONS =======================

  async getReservations() {
    if (firestore) {
      try {
        const snap = await getDocs(collection(firestore, 'reservations'));
        const data = [];
        snap.forEach(d => data.push({ id: d.id, ...d.data() }));
        this._saveLocal('reservations', data);
        return data;
      } catch (e) {
        console.warn('[DB] Firestore getReservations failed:', e);
      }
    }
    return this._local('reservations');
  }

  async getReservationsByShop(shopId) {
    const all = await this.getReservations();
    return all.filter(r => r.shopId === shopId);
  }

  async getReservationsByCustomer(customerId) {
    const all = await this.getReservations();
    return all.filter(r => r.customerId === customerId);
  }

  async addReservation(reservation) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const id = `DKS-${rand}`;
    const newRes = {
      id,
      code: id,
      ...reservation,
      status: 'reserved',
      createdAt: new Date().toISOString(),
    };

    if (firestore) {
      try {
        await setDoc(doc(firestore, 'reservations', id), newRes);
      } catch (e) { console.error('[DB] Firestore addReservation failed:', e); }
    }

    const reservations = this._local('reservations');
    reservations.push(newRes);
    this._saveLocal('reservations', reservations);

    // Increment customer totalReservations
    await this.updateCustomer(reservation.customerId, {
      totalReservations: ((await this.getCustomer(reservation.customerId))?.totalReservations || 0) + 1
    });

    return newRes;
  }

  async updateReservationStatus(id, status) {
    let res = null;

    if (firestore) {
      try {
        const snap = await getDoc(doc(firestore, 'reservations', id));
        if (snap.exists()) {
          res = { id: snap.id, ...snap.data(), status };
          await setDoc(doc(firestore, 'reservations', id), res);
        }
      } catch (e) { console.error('[DB] Firestore updateReservationStatus failed:', e); }
    }

    const reservations = this._local('reservations');
    const index = reservations.findIndex(r => r.id === id);
    if (index !== -1) {
      reservations[index].status = status;
      res = reservations[index];
      this._saveLocal('reservations', reservations);
    }

    // If confirmed: award coins + increment buyer count
    if (status === 'confirmed' && res) {
      const cust = await this.getCustomer(res.customerId);
      if (cust) {
        await this.updateCustomer(res.customerId, {
          superCoins: (cust.superCoins || 0) + (res.rewardCoins || 0)
        });
      }
      const shop = await this.getShop(res.shopId);
      if (shop) {
        await this.updateShop(res.shopId, {
          monthlyBuyers: (shop.monthlyBuyers || 0) + 1
        });
      }
    }

    return res;
  }

  // ======================= CUSTOMERS =======================

  async getCustomers() {
    if (firestore) {
      try {
        const snap = await getDocs(collection(firestore, 'customers'));
        const data = [];
        snap.forEach(d => data.push({ id: d.id, ...d.data() }));
        this._saveLocal('customers', data);
        return data;
      } catch (e) {
        console.warn('[DB] Firestore getCustomers failed:', e);
      }
    }
    return this._local('customers');
  }

  async getCustomer(id) {
    if (!id) return null;
    if (firestore) {
      try {
        const snap = await getDoc(doc(firestore, 'customers', id));
        if (snap.exists()) return { id: snap.id, ...snap.data() };
        return null;
      } catch (e) {
        console.warn('[DB] Firestore getCustomer failed:', e);
      }
    }
    return this._local('customers').find(c => c.id === id) || null;
  }

  async addCustomer(customerData) {
    const id = customerData.id || ('c_' + Date.now());
    const newCust = {
      id,
      name: customerData.name,
      phone: customerData.phone,
      superCoins: customerData.superCoins || 0,
      totalReservations: customerData.totalReservations || 0,
      joinedAt: customerData.joinedAt || new Date().toISOString(),
    };

    if (firestore) {
      try {
        await setDoc(doc(firestore, 'customers', id), newCust);
      } catch (e) { console.error('[DB] Firestore addCustomer failed:', e); }
    }

    const customers = this._local('customers');
    const idx = customers.findIndex(c => c.id === id);
    if (idx >= 0) customers[idx] = newCust; else customers.push(newCust);
    this._saveLocal('customers', customers);

    return newCust;
  }

  async updateCustomer(id, updatedData) {
    if (!id) return null;

    if (firestore) {
      try {
        const snap = await getDoc(doc(firestore, 'customers', id));
        if (snap.exists()) {
          const merged = { id, ...snap.data(), ...updatedData };
          await setDoc(doc(firestore, 'customers', id), merged);
        }
      } catch (e) { console.error('[DB] Firestore updateCustomer failed:', e); }
    }

    const customers = this._local('customers');
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updatedData };
      this._saveLocal('customers', customers);

      // Sync session if this is the current user
      const curr = this.getCurrentUser();
      if (curr && curr.id === id) {
        this.setCurrentUser({ ...curr, ...customers[index] });
      }
      return customers[index];
    }
    return null;
  }

  async addSuperCoinsToCustomer(customerId, amount) {
    const cust = await this.getCustomer(customerId);
    if (cust) {
      const updatedCoins = (cust.superCoins || 0) + amount;
      return await this.updateCustomer(customerId, { superCoins: updatedCoins });
    }
    return null;
  }

  // ======================= SESSION (always localStorage) =======================

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    return JSON.parse(localStorage.getItem('dos_current_user') || 'null');
  }

  setCurrentUser(user) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dos_current_user', JSON.stringify(user));
  }

  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('dos_current_user');
  }

  // ======================= AUTH HELPERS =======================

  // Find customer by phone across Firestore or local
  async findCustomerByPhone(phone) {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\s/g, '');
    const customers = await this.getCustomers();
    return customers.find(c => {
      const cp = (c.phone || '').replace(/\s/g, '');
      return cp === cleanPhone || cp.endsWith(cleanPhone.slice(-10)) || cleanPhone.endsWith(cp.slice(-10));
    }) || null;
  }
}

export const db = new Database();
export const isLiveFirebase = isFirebaseConfigured;
export { auth, firestore };
export default db;
