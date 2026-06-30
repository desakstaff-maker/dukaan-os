import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { mockShops, mockProducts, mockCustomers, mockReservations } from './mockData';

// Configuration check for live Firebase
const isFirebaseConfigured = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let auth = null;
let dbInstance = null;

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
    dbInstance = getFirestore(app);
  } catch (err) {
    console.error("Firebase init failed, falling back to Mock:", err);
  }
}

// LocalStorage Database helper (replicates Firebase Firestore & Auth with offline-first synchronization)
class LocalStorageDb {
  constructor() {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('dos_shops')) {
        localStorage.setItem('dos_shops', JSON.stringify(mockShops));
      }
      if (!localStorage.getItem('dos_products')) {
        localStorage.setItem('dos_products', JSON.stringify(mockProducts));
      }
      if (!localStorage.getItem('dos_customers')) {
        localStorage.setItem('dos_customers', JSON.stringify(mockCustomers));
      }
      if (!localStorage.getItem('dos_reservations')) {
        localStorage.setItem('dos_reservations', JSON.stringify(mockReservations));
      }
      if (!localStorage.getItem('dos_current_user')) {
        localStorage.setItem('dos_current_user', JSON.stringify(null));
      }
      
      // Auto-trigger Firestore real-time synchronization on initialization
      this.syncWithFirestore();
    }
  }

  get(key) {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('dos_' + key) || '[]');
  }

  save(key, val) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dos_' + key, JSON.stringify(val));
  }

  async syncWithFirestore() {
    if (!isFirebaseConfigured || !dbInstance) return;
    try {
      // Sync Shops
      const shopsSnap = await getDocs(collection(dbInstance, 'shops'));
      const shops = [];
      shopsSnap.forEach(d => shops.push({ id: d.id, ...d.data() }));
      if (shops.length > 0) this.save('shops', shops);

      // Sync Products
      const productsSnap = await getDocs(collection(dbInstance, 'products'));
      const products = [];
      productsSnap.forEach(d => products.push({ id: d.id, ...d.data() }));
      if (products.length > 0) this.save('products', products);

      // Sync Reservations
      const resSnap = await getDocs(collection(dbInstance, 'reservations'));
      const res = [];
      resSnap.forEach(d => res.push({ id: d.id, ...d.data() }));
      if (res.length > 0) this.save('reservations', res);

      // Sync Customers
      const custSnap = await getDocs(collection(dbInstance, 'customers'));
      const cust = [];
      custSnap.forEach(d => cust.push({ id: d.id, ...d.data() }));
      if (cust.length > 0) this.save('customers', cust);
    } catch (e) {
      console.warn("Firestore sync failed (using local cache):", e);
    }
  }

  // Shops CRUD
  getShops() {
    return this.get('shops');
  }

  getShop(id) {
    return this.getShops().find(s => s.id === id);
  }

  async addShop(shop) {
    const shops = this.getShops();
    const id = shop.slug || shop.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newShop = {
      id,
      ...shop,
      rating: parseFloat(shop.rating) || 4.0,
      monthlyBuyers: parseInt(shop.monthlyBuyers) || 0,
      sponsored: false,
      topPartner: false,
      verified: true,
      featured: false,
      banner: shop.banner || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800",
      logo: shop.logo || "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&q=80&w=400"
    };
    
    shops.push(newShop);
    this.save('shops', shops);

    if (isFirebaseConfigured && dbInstance) {
      try {
        await setDoc(doc(dbInstance, 'shops', id), newShop);
      } catch (err) {
        console.error("Firestore addShop failed:", err);
      }
    }
    return newShop;
  }

  async updateShop(id, updatedData) {
    const shops = this.getShops();
    const index = shops.findIndex(s => s.id === id);
    if (index !== -1) {
      shops[index] = { ...shops[index], ...updatedData };
      this.save('shops', shops);

      if (isFirebaseConfigured && dbInstance) {
        try {
          await setDoc(doc(dbInstance, 'shops', id), shops[index]);
        } catch (err) {
          console.error("Firestore updateShop failed:", err);
        }
      }
      return shops[index];
    }
    return null;
  }

  async deleteShop(id) {
    const shops = this.getShops().filter(s => s.id !== id);
    this.save('shops', shops);

    if (isFirebaseConfigured && dbInstance) {
      try {
        await deleteDoc(doc(dbInstance, 'shops', id));
      } catch (err) {
        console.error("Firestore deleteShop failed:", err);
      }
    }
    return true;
  }

  // Products CRUD
  getProducts() {
    return this.get('products');
  }

  getProductsByShop(shopId) {
    return this.getProducts().filter(p => p.shopId === shopId);
  }

  async addProduct(product) {
    const products = this.getProducts();
    const id = 'p_' + Date.now();
    const newProduct = {
      id,
      ...product,
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    this.save('products', products);

    if (isFirebaseConfigured && dbInstance) {
      try {
        await setDoc(doc(dbInstance, 'products', id), newProduct);
      } catch (err) {
        console.error("Firestore addProduct failed:", err);
      }
    }
    return newProduct;
  }

  async updateProduct(id, updatedData) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { 
        ...products[index], 
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      this.save('products', products);

      if (isFirebaseConfigured && dbInstance) {
        try {
          await setDoc(doc(dbInstance, 'products', id), products[index]);
        } catch (err) {
          console.error("Firestore updateProduct failed:", err);
        }
      }
      return products[index];
    }
    return null;
  }

  async deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.save('products', products);

    if (isFirebaseConfigured && dbInstance) {
      try {
        await deleteDoc(doc(dbInstance, 'products', id));
      } catch (err) {
        console.error("Firestore deleteProduct failed:", err);
      }
    }
    return true;
  }

  // Reservations CRUD
  getReservations() {
    return this.get('reservations');
  }

  getReservationsByShop(shopId) {
    return this.getReservations().filter(r => r.shopId === shopId);
  }

  getReservationsByCustomer(customerId) {
    return this.getReservations().filter(r => r.customerId === customerId);
  }

  async addReservation(reservation) {
    const reservations = this.getReservations();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const id = `DKS-${rand}`;
    const newReservation = {
      id,
      code: id,
      ...reservation,
      status: 'reserved',
      createdAt: new Date().toISOString()
    };
    
    reservations.push(newReservation);
    this.save('reservations', reservations);

    if (isFirebaseConfigured && dbInstance) {
      try {
        await setDoc(doc(dbInstance, 'reservations', id), newReservation);
      } catch (err) {
        console.error("Firestore addReservation failed:", err);
      }
    }

    // Increment Customer totalReservations count
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === reservation.customerId);
    if (index !== -1) {
      const updatedTotal = (customers[index].totalReservations || 0) + 1;
      await this.updateCustomer(reservation.customerId, { totalReservations: updatedTotal });
    }

    return newReservation;
  }

  async updateReservationStatus(id, status) {
    const reservations = this.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index !== -1) {
      reservations[index].status = status;
      this.save('reservations', reservations);

      if (isFirebaseConfigured && dbInstance) {
        try {
          await setDoc(doc(dbInstance, 'reservations', id), reservations[index]);
        } catch (err) {
          console.error("Firestore updateReservationStatus failed:", err);
        }
      }

      const res = reservations[index];
      if (status === 'confirmed') {
        // Award Coins
        const customers = this.getCustomers();
        const cust = customers.find(c => c.id === res.customerId);
        if (cust) {
          const updatedCoins = (cust.superCoins || 0) + res.rewardCoins;
          await this.updateCustomer(res.customerId, { superCoins: updatedCoins });
        }

        // Increment monthlyBuyers
        const shop = this.getShop(res.shopId);
        if (shop) {
          await this.updateShop(res.shopId, { 
            monthlyBuyers: (shop.monthlyBuyers || 0) + 1 
          });
        }
      }
      return reservations[index];
    }
    return null;
  }

  // Customers CRUD
  getCustomers() {
    return this.get('customers');
  }

  getCustomer(id) {
    return this.getCustomers().find(c => c.id === id);
  }

  async updateCustomer(id, updatedData) {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updatedData };
      this.save('customers', customers);
      
      if (isFirebaseConfigured && dbInstance) {
        try {
          await setDoc(doc(dbInstance, 'customers', id), customers[index]);
        } catch (err) {
          console.error("Firestore updateCustomer failed:", err);
        }
      }

      // Update active session
      const curr = this.getCurrentUser();
      if (curr && curr.id === id) {
        this.setCurrentUser({ ...curr, ...customers[index] });
      }
      return customers[index];
    }
    return null;
  }

  async addSuperCoinsToCustomer(customerId, amount) {
    const cust = this.getCustomer(customerId);
    if (cust) {
      const updatedCoins = (cust.superCoins || 0) + amount;
      return await this.updateCustomer(customerId, { superCoins: updatedCoins });
    }
    return null;
  }

  // Session Manager
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    return JSON.parse(localStorage.getItem('dos_current_user') || 'null');
  }

  setCurrentUser(user) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dos_current_user', JSON.stringify(user));
  }

  // Auth OTP Flow Mock Simulator (for local testing)
  loginWithPhoneMock(phone) {
    const customers = this.getCustomers();
    const matched = customers.find(c => c.phone.includes(phone) || phone.includes(c.phone));
    
    return {
      phone,
      exists: !!matched,
      confirm: async (otp) => {
        if (!otp || otp.length < 4) {
          throw new Error("Invalid OTP code");
        }

        let userSession = {};
        if (matched) {
          userSession = {
            role: 'customer',
            id: matched.id,
            name: matched.name,
            phone: matched.phone,
            superCoins: matched.superCoins || 0,
            joinedAt: matched.joinedAt || new Date().toISOString(),
            totalReservations: matched.totalReservations || 0
          };
          this.setCurrentUser(userSession);
          return { user: userSession, isNewUser: false };
        } else {
          return { phone, isNewUser: true };
        }
      }
    };
  }

  async registerMock(name, phone) {
    const customers = this.getCustomers();
    const id = 'c_' + Date.now();
    const newCust = {
      id,
      name: name,
      phone: phone,
      superCoins: 0,
      totalReservations: 0,
      joinedAt: new Date().toISOString()
    };
    
    customers.push(newCust);
    this.save('customers', customers);

    if (isFirebaseConfigured && dbInstance) {
      try {
        await setDoc(doc(dbInstance, 'customers', id), newCust);
      } catch (err) {
        console.error("Firestore registerMock failed:", err);
      }
    }

    const session = {
      role: 'customer',
      id: newCust.id,
      name: newCust.name,
      phone: newCust.phone,
      superCoins: newCust.superCoins,
      joinedAt: newCust.joinedAt,
      totalReservations: newCust.totalReservations
    };
    this.setCurrentUser(session);
    return session;
  }

  login(emailOrPhone, role, shopId = null) {
    let user = {
      role,
      email: emailOrPhone.includes('@') ? emailOrPhone : null,
      phone: !emailOrPhone.includes('@') ? emailOrPhone : null,
    };

    if (role === 'admin') {
      user.id = 'admin_user';
      user.name = 'Founder / Admin';
    } else if (role === 'shopkeeper') {
      const shop = this.getShop(shopId) || this.getShops()[0];
      user.id = shop ? shop.id : 'unknown';
      user.name = shop ? shop.owner : 'Shop Owner';
      user.shopId = shop ? shop.id : 'unknown';
      user.shopName = shop ? shop.name : 'Unknown Shop';
    } else {
      const customers = this.getCustomers();
      let customer = customers.find(c => c.phone === emailOrPhone || c.email === emailOrPhone);
      if (!customer) {
        customer = {
          id: 'c_' + Date.now(),
          name: emailOrPhone.split('@')[0],
          phone: !emailOrPhone.includes('@') ? emailOrPhone : '+919999988888',
          superCoins: 0,
          totalReservations: 0,
          joinedAt: new Date().toISOString()
        };
        customers.push(customer);
        this.save('customers', customers);
      }
      user = { ...user, ...customer };
    }

    this.setCurrentUser(user);
    return user;
  }

  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('dos_current_user');
  }
}

export const db = new LocalStorageDb();
export const isLiveFirebase = isFirebaseConfigured;
export { auth, dbInstance };
export default db;
