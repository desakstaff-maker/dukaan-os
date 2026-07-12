import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

import {
  db,
  COLLECTIONS
} from './firebase';



// =====================================================
// CONSTANTS
// =====================================================

const SESSION_KEY =
  'dukaanos_session';

const REMEMBER_KEY =
  'dukaanos_remember';



// =====================================================
// HELPERS
// =====================================================

function normalizePhone(
  phone
) {

  return String(phone)
    .replace(/\D/g, '')
    .slice(-10);
}



function saveSession(
  user,
  remember = true
) {

  const storage =
    remember
      ? localStorage
      : sessionStorage;

  storage.setItem(
    SESSION_KEY,
    JSON.stringify(user)
  );

  if (remember) {

    localStorage.setItem(
      REMEMBER_KEY,
      'true'
    );
  }
}



function removeSession() {

  localStorage.removeItem(
    SESSION_KEY
  );

  sessionStorage.removeItem(
    SESSION_KEY
  );

  localStorage.removeItem(
    REMEMBER_KEY
  );
}



// =====================================================
// SIGNUP
// =====================================================

export async function signup(
  data
) {

  const phone =
    normalizePhone(
      data.phone
    );

  const q = query(
    collection(
      db,
      COLLECTIONS.customers
    ),
    where(
      'phone',
      '==',
      phone
    )
  );

  const snap =
    await getDocs(q);

  if (!snap.empty) {

    throw new Error(
      'Phone already registered'
    );
  }

  const customer = {

    name:
      data.name,

    phone,

    village:
      data.village,

    pin:
      String(
        data.pin
      ),

    superCoins:
      0,

    totalPurchases:
      0,

    totalReservations:
      0,

    joinedAt:
      serverTimestamp(),

    lastLogin:
      serverTimestamp()
  };

  const ref =
    await addDoc(
      collection(
        db,
        COLLECTIONS.customers
      ),
      customer
    );

  const user = {

    id:
      ref.id,

    ...customer,

    joinedAt:
      new Date()
  };

  saveSession(
    user,
    data.rememberDevice
  );

  return user;
}



// =====================================================
// LOGIN
// =====================================================

export async function login(
  phone,
  pin,
  remember = true
) {

  phone =
    normalizePhone(
      phone
    );

  const q = query(
    collection(
      db,
      COLLECTIONS.customers
    ),
    where(
      'phone',
      '==',
      phone
    )
  );

  const snap =
    await getDocs(q);

  if (
    snap.empty
  ) {

    throw new Error(
      'Account not found'
    );
  }

  const customer =
    snap.docs[0];

  const data =
    customer.data();

  if (

    String(
      data.pin
    ) !==
    String(
      pin
    )

  ) {

    throw new Error(
      'Wrong PIN'
    );
  }

  await updateDoc(

    doc(
      db,
      COLLECTIONS.customers,
      customer.id
    ),

    {
      lastLogin:
        serverTimestamp()
    }
  );

  const user = {

    id:
      customer.id,

    ...data,

    lastLogin:
      new Date()
  };

  saveSession(
    user,
    remember
  );

  return user;
}



// =====================================================
// CURRENT USER
// =====================================================

export async function getCurrentUser() {

  if (
    typeof window ===
    'undefined'
  ) {

    return null;
  }

  let raw =

    localStorage.getItem(
      SESSION_KEY
    ) ||

    sessionStorage.getItem(
      SESSION_KEY
    );

  if (!raw)
    return null;

  try {

    const user =
      JSON.parse(
        raw
      );

    const ref =
      doc(
        db,
        COLLECTIONS.customers,
        user.id
      );

    const q = query(
      collection(
        db,
        COLLECTIONS.customers
      ),
      where(
        '__name__',
        '==',
        user.id
      )
    );

    const snap =
      await getDocs(
        q
      );

    if (
      snap.empty
    ) {

      logout();

      return null;
    }

    const fresh = {

      id:
        snap.docs[0]
          .id,

      ...snap.docs[0]
        .data()
    };

    saveSession(
      fresh,
      localStorage.getItem(
        REMEMBER_KEY
      ) ===
        'true'
    );

    return fresh;

  } catch {

    logout();

    return null;
  }
}



// =====================================================
// REFRESH USER
// =====================================================

export async function refreshUser(
  id
) {

  const q = query(
    collection(
      db,
      COLLECTIONS.customers
    ),
    where(
      '__name__',
      '==',
      id
    )
  );

  const snap =
    await getDocs(
      q
    );

  if (
    snap.empty
  ) {

    return null;
  }

  const user = {

    id:
      snap.docs[0]
        .id,

    ...snap.docs[0]
      .data()
  };

  saveSession(
    user,
    localStorage.getItem(
      REMEMBER_KEY
    ) ===
      'true'
  );

  return user;
}



// =====================================================
// UPDATE PROFILE
// =====================================================

export async function updateProfile(
  id,
  data
) {

  await updateDoc(

    doc(
      db,
      COLLECTIONS.customers,
      id
    ),

    data
  );

  return refreshUser(
    id
  );
}



// =====================================================
// CHANGE PIN
// =====================================================

export async function changePin(

  id,

  oldPin,

  newPin

) {

  const user =
    await refreshUser(
      id
    );

  if (
    !user
  ) {

    throw new Error(
      'User not found'
    );
  }

  if (

    String(
      user.pin
    ) !==
    String(
      oldPin
    )

  ) {

    throw new Error(
      'Old PIN incorrect'
    );
  }

  await updateDoc(

    doc(
      db,
      COLLECTIONS.customers,
      id
    ),

    {
      pin:
        String(
          newPin
        )
    }
  );

  return true;
}



// =====================================================
// LOGOUT
// =====================================================

export function logout() {

  removeSession();
}



// =====================================================
// SESSION CHECK
// =====================================================

export function isLoggedIn() {

  if (
    typeof window ===
    'undefined'
  ) {

    return false;
  }

  return !!(

    localStorage.getItem(
      SESSION_KEY
    ) ||

    sessionStorage.getItem(
      SESSION_KEY
    )
  );
}