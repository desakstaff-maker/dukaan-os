import { mockShops, mockProducts, mockCustomers, mockReservations } from './mockData';

// Configuration check for live Firebase
const isFirebaseConfigured = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let auth = null;
let dbInstance = null;

if (isFirebaseConfigured) {
  // Dynamic imports/initialization of real Firebase
  try {
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
    
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    dbInstance = getFirestore(app);
  } catch (err) {
    console.error("Firebase init failed, falling back to Mock:", err);
  }
}

// LocalStorage Database helper (replicates Firebase Firestore & Auth)
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
        localStorage.setItem('dos_current_user', JSON.stringify({
          role: 'customer',
          id: 'c1',
          name: 'Rahul Duhan',
          phone: '+919466778899',
          joinedAt: '2026-06-01T00:00:00Z',
          superCoins: 15
        }));
      }
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

  // Shops CRUD
  getShops() {
    return this.get('shops');
  }

  getShop(id) {
    return this.getShops().find(s => s.id === id);
  }

  addShop(shop) {
    const shops = this.getShops();
    const newShop = {
      ...shop,
      id: shop.slug || shop.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
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
    return newShop;
  }

  updateShop(id, updatedData) {
    const shops = this.getShops();
    const index = shops.findIndex(s => s.id === id);
    if (index !== -1) {
      shops[index] = { ...shops[index], ...updatedData };
      this.save('shops', shops);
      return shops[index];
    }
    return null;
  }

  deleteShop(id) {
    const shops = this.getShops().filter(s => s.id !== id);
    this.save('shops', shops);
    
    // Clean products belonging to deleted shop
    const products = this.getProducts().filter(p => p.shopId !== id);
    this.save('products', products);
    return true;
  }

  // Products CRUD
  getProducts() {
    return this.get('products');
  }

  getProductsByShop(shopId) {
    return this.getProducts().filter(p => p.shopId === shopId);
  }

  addProduct(product) {
    const products = this.getProducts();
    const newProduct = {
      ...product,
      id: 'p_' + Date.now(),
      updatedAt: new Date().toISOString()
    };
    products.push(newProduct);
    this.save('products', products);
    return newProduct;
  }

  updateProduct(id, updatedData) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { 
        ...products[index], 
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      this.save('products', products);
      return products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.save('products', products);
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

  addReservation(reservation) {
    const reservations = this.getReservations();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const newReservation = {
      ...reservation,
      id: `DKS-${rand}`,
      code: `DKS-${rand}`,
      status: 'reserved',
      createdAt: new Date().toISOString()
    };
    reservations.push(newReservation);
    this.save('reservations', reservations);

    // Increment Customer totalReservations
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === reservation.customerId);
    if (index !== -1) {
      customers[index].totalReservations = (customers[index].totalReservations || 0) + 1;
      this.save('customers', customers);
      
      const curr = this.getCurrentUser();
      if (curr && curr.id === reservation.customerId) {
        curr.totalReservations = customers[index].totalReservations;
        this.setCurrentUser(curr);
      }
    }

    return newReservation;
  }

  updateReservationStatus(id, status) {
    const reservations = this.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index !== -1) {
      reservations[index].status = status;
      this.save('reservations', reservations);

      const res = reservations[index];

      // Handle SuperCoins confirmation payout
      if (status === 'confirmed') {
        this.addSuperCoinsToCustomer(res.customerId, res.rewardCoins);

        const shop = this.getShop(res.shopId);
        if (shop) {
          this.updateShop(res.shopId, { 
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
    return this.getCustomers().find(c => c.id === id) || mockCustomers[0];
  }

  updateCustomer(id, updatedData) {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updatedData };
      this.save('customers', customers);
      
      // Update session if matched
      const curr = this.getCurrentUser();
      if (curr && curr.id === id) {
        this.setCurrentUser({ ...curr, ...customers[index] });
      }
      return customers[index];
    }
    return null;
  }

  addSuperCoinsToCustomer(customerId, amount) {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === customerId);
    if (index !== -1) {
      customers[index].superCoins = (customers[index].superCoins || 0) + amount;
      this.save('customers', customers);
      
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === customerId) {
        currentUser.superCoins = customers[index].superCoins;
        this.setCurrentUser(currentUser);
      }
      return customers[index];
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

  // Auth OTP Flow Mock Simulator
  loginWithPhoneMock(phone) {
    const customers = this.getCustomers();
    const matched = customers.find(c => c.phone.includes(phone) || phone.includes(c.phone));
    
    // Return a mock verification handler
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
          // Triggers registration flow in frontend
          return { phone, isNewUser: true };
        }
      }
    };
  }

  registerMock(name, phone) {
    const customers = this.getCustomers();
    const newCust = {
      id: 'c_' + Date.now(),
      name: name,
      phone: phone,
      superCoins: 0,
      totalReservations: 0,
      joinedAt: new Date().toISOString()
    };
    customers.push(newCust);
    this.save('customers', customers);

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
      user.id = shop.id;
      user.name = shop.owner;
      user.shopId = shop.id;
      user.shopName = shop.name;
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

// Live Firebase integration placeholder logic (for vercel builds)
export const setupRealPhoneAuth = async (phoneNumber, recaptchaVerifier) => {
  if (!auth) throw new Error("Firebase auth not configured");
  const { signInWithPhoneNumber } = await import('firebase/auth');
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

export const syncRealFirestoreUser = async (uid, name, phone) => {
  if (!dbInstance) return;
  const { doc, setDoc, getDoc } = await import('firebase/firestore');
  
  const docRef = doc(dbInstance, 'customers', uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    const data = {
      uid,
      name,
      phone,
      supercoins: 0,
      totalReservations: 0,
      joinedAt: new Date().toISOString()
    };
    await setDoc(docRef, data);
    return data;
  }
  return docSnap.data();
};

export const db = new LocalStorageDb();
export const isLiveFirebase = isFirebaseConfigured;
export default db;
