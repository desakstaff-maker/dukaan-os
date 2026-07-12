# Dukaan OS

Dukaan OS is a mobile-first hyperlocal search engine and reservation platform designed for rural and tier-2/3/4 India.

---

# Features

## Customer

✅ Search products and shops  
✅ Product-first intelligent search  
✅ Shop pages with products and reviews  
✅ Reservation system  
✅ SuperCoins rewards  
✅ Reservation history  
✅ Coin history  
✅ Explore Map  
✅ Customer account  
✅ Login using mobile + 4 digit PIN  
✅ Save customer details for next reservation

---

## Shop Owner

✅ Secret inventory update link  
✅ Add products  
✅ Edit products  
✅ Delete products  
✅ Update stock  
✅ Update price  
✅ Update product name

---

## Admin

✅ Password protected admin panel  
✅ Create shops  
✅ Edit shops  
✅ Delete shops  
✅ Change plans  
✅ Toggle Top Partner  
✅ Edit products  
✅ Delete products  
✅ Manage reservations  
✅ Change reservation status

---

# Plans

## FREE

- Search visibility
- Shop page
- Reservations
- Reviews
- Inventory link

---

## PRO

- Better visibility
- Extra customer SuperCoins
- Sales tips
- Basic marketing support

---

## BUSINESS

- TOP PARTNER badge
- Homepage promotion
- Manual website customization
- Manual product image enhancement
- Premium marketing support
- Highest visibility

---

# SuperCoins

20 SuperCoins on every ₹400 purchase.

10 SuperCoins = ₹1 value.

---

# Reservation Flow

Customer

Search Product
↓
Reserve Product
↓
Choose Quantity
↓
Choose Visit Date
↓
Choose Visit Time
↓
Choose Village
↓
Reservation Created

↓

Shopkeeper Opens Secret Link

↓

Confirms Purchase

↓

Customer Gets SuperCoins

---

# Environment Variables

Create .env.local

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

NEXT_PUBLIC_ADMIN_PASSWORD=

NEXT_PUBLIC_SUPERCOINS_PER_RUPEE=10
NEXT_PUBLIC_SUPERCOINS_PERCENT=5
NEXT_PUBLIC_RESERVATION_PREFIX=DKS
```

---

# Run

```bash
npm install
npm run dev
```

---

# Deploy

Deploy directly to:

https://vercel.com

---

# Folder Structure

```
src
 ├── app
 ├── components
 ├── data
 ├── lib
 └── utils
```

---

# Future Features

- WhatsApp integration
- AI website generation
- Automatic subdomains
- Image enhancement
- QR verification
- Merchant analytics
- Marketing automation
- Inventory reminders
- Smart recommendations
- Auto banners