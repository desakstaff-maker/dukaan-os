import { initializeApp, getApps, getApp } from 'firebase/app';

import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';



// =====================================================
// ENV CHECK
// =====================================================

const firebaseConfig = {

  apiKey:
    process.env
      .NEXT_PUBLIC_FIREBASE_API_KEY,

  authDomain:
    process.env
      .NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

  projectId:
    process.env
      .NEXT_PUBLIC_FIREBASE_PROJECT_ID,

  storageBucket:
    process.env
      .NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    process.env
      .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    process.env
      .NEXT_PUBLIC_FIREBASE_APP_ID,

  measurementId:
    process.env
      .NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};



export const FIREBASE_ENABLED =

  !!firebaseConfig.apiKey &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.appId;



// =====================================================
// FIREBASE APP
// =====================================================

export const app =

  getApps().length

    ? getApp()

    : initializeApp(
        firebaseConfig
      );



// =====================================================
// FIRESTORE
// =====================================================

let firestore;

try {

  firestore =
    initializeFirestore(
      app,

      {
        cacheSizeBytes:
          CACHE_SIZE_UNLIMITED,

        localCache:
          persistentLocalCache({

            tabManager:
              persistentMultipleTabManager()
          })
      }
    );

} catch {

  firestore =
    getFirestore(
      app
    );
}

export const db =
  firestore;



// =====================================================
// COLLECTIONS
// =====================================================

export const COLLECTIONS = {

  shops:
    'shops',

  products:
    'products',

  customers:
    'customers',

  reservations:
    'reservations',

  reviews:
    'reviews',

  coinHistory:
    'coinHistory',
  
};



// =====================================================
// SHOP PLANS
// =====================================================

export const SHOP_PLANS = {

  FREE:
    'FREE',

  PRO:
    'PRO',

  BUSINESS:
    'BUSINESS'
};



// =====================================================
// RESERVATION STATUS
// =====================================================

export const RESERVATION_STATUS = {

  RESERVED:
    'reserved',

  CONFIRMED:
    'confirmed',

  COMPLETED:
    'completed',

  CANCELLED:
    'cancelled',

  CANCELLED_NOT_VISITED:
    'cancelled_not_visited'
};



// =====================================================
// STOCK STATUS
// =====================================================

export const STOCK_STATUS = {

  AVAILABLE:
    'available',

  LIKELY:
    'likely_available',

  OUT:
    'out_of_stock'
};



// =====================================================
// SUPERCOINS
// =====================================================

export const SUPERCOINS = {

  COINS_PER_RUPEE:
    Number(
      process.env
        .NEXT_PUBLIC_SUPERCOINS_PER_RUPEE
    ) || 10,

  DEFAULT_PERCENT:
    Number(
      process.env
        .NEXT_PUBLIC_SUPERCOINS_PERCENT
    ) || 5,

  BUSINESS_BONUS:
    1.5,

  PRO_BONUS:
    1.2
};



// =====================================================
// ADMIN
// =====================================================

export const ADMIN = {

  PASSWORD:

    process.env
      .NEXT_PUBLIC_ADMIN_PASSWORD ||

    'ABHInonu01'
};



// =====================================================
// RESERVATION SETTINGS
// =====================================================

export const RESERVATION = {

  PREFIX:

    process.env
      .NEXT_PUBLIC_RESERVATION_PREFIX ||

    'DKS',

  EXPIRY_HOURS:
    24
};



// =====================================================
// APP SETTINGS
// =====================================================

export const APP_SETTINGS = {

  APP_NAME:
    'Dukaan OS',

  APP_URL:

    process.env
      .NEXT_PUBLIC_APP_URL ||

    'http://localhost:3000',

  DEFAULT_LAT:
    29.3152,

  DEFAULT_LNG:
    76.3150,

  DEFAULT_CITY:
    'Jind',

  DEFAULT_STATE:
    'Haryana',

  DEFAULT_COUNTRY:
    'India'
};



// =====================================================
// HELPERS
// =====================================================

export function generateTicketId() {

  return `${RESERVATION.PREFIX}-${

    Math.floor(
      1000 +
      Math.random() *
      9000
    )

  }`;
}



export function calculateReward(

  amount,

  multiplier = 1

) {

  return Math.floor(

    amount *

    (
      SUPERCOINS
        .DEFAULT_PERCENT /
      100
    ) *

    multiplier
  );
}



export default app;