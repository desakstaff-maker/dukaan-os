export const mockShops = [
  {
    id: "sharmaagro",
    name: "Sharma Agro & Tractor Spares",
    owner: "Ramesh Sharma",
    phone: "+919876543210",
    email: "sharma.agro@example.com",
    address: "Opposite Grain Market, Jind Road, Safidon, Jind, Haryana",
    lat: 29.3204,
    lng: 76.3134,
    monthlyBuyers: 320,
    rating: 4.2,
    plan: "Business",
    sponsored: false,
    topPartner: true,
    verified: true,
    featured: true,
    banner: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800",
    description: "Your trusted partner for all tractor parts, agricultural spares, organic fertilizers, and premium lubricants in Jind region.",
    reviews: [
      { id: "r1", customerName: "Jaipal Singh", rating: 5, comment: "Genuine Mahindra spare parts available. Very honest price.", createdAt: "2026-06-25T10:00:00Z" },
      { id: "r2", customerName: "Rajender Dahiya", rating: 4, comment: "Good service, shopkeeper explained tractor pump options well.", createdAt: "2026-06-28T14:30:00Z" }
    ]
  },
  {
    id: "guptastore",
    name: "Gupta Fertilizer & Oil Store",
    owner: "Suresh Gupta",
    phone: "+919812345678",
    email: "gupta.fertilizer@example.com",
    address: "Gohana Bypass Chowk, Jind, Haryana",
    lat: 29.3254,
    lng: 76.3210,
    monthlyBuyers: 180,
    rating: 4.8,
    plan: "Pro",
    sponsored: true,
    topPartner: false,
    verified: true,
    featured: false,
    banner: "https://images.unsplash.com/photo-1589923188900-85dae4409f7c?auto=format&fit=crop&q=80&w=800",
    description: "Dealers in high-quality engine oils, diesel filters, spray pumps, and all types of crop nutrients.",
    reviews: [
      { id: "r3", customerName: "Manpreet Mann", rating: 5, comment: "Always has Mobil engine oil in stock. Highly recommended.", createdAt: "2026-06-20T08:15:00Z" }
    ]
  },
  {
    id: "haryanaspares",
    name: "Haryana Agro Spares & Tools",
    owner: "Anil Kumar",
    phone: "+919991122334",
    email: "haryana.spares@example.com",
    address: "Near Old Bus Stand, Jind, Haryana",
    lat: 29.3090,
    lng: 76.2990,
    monthlyBuyers: 45,
    rating: 3.9,
    plan: "Free",
    sponsored: false,
    topPartner: false,
    verified: false,
    featured: false,
    banner: "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&q=80&w=800",
    description: "Affordable machinery tools, nuts, bolts, and tractor filters.",
    reviews: []
  }
];

export const mockProducts = [
  {
    id: "p1",
    shopId: "sharmaagro",
    shopName: "Sharma Agro & Tractor Spares",
    name: "Tractor Oil Filter (Mahindra/Sonalika)",
    price: 450,
    stockStatus: "Available",
    category: "Tractor Spares",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400",
    updatedAt: "2026-06-30T05:00:00Z", // 2 hours ago from current local time 7 AM
    rewardCoins: 5
  },
  {
    id: "p2",
    shopId: "sharmaagro",
    shopName: "Sharma Agro & Tractor Spares",
    name: "NPK Fertilizer 19:19:19 (5kg)",
    price: 600,
    stockStatus: "Likely Available",
    category: "Fertilizer",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=400",
    updatedAt: "2026-06-29T18:00:00Z",
    rewardCoins: 8
  },
  {
    id: "p3",
    shopId: "sharmaagro",
    shopName: "Sharma Agro & Tractor Spares",
    name: "Mahindra Tractor Spare Fan Belt",
    price: 320,
    stockStatus: "Available",
    category: "Tractor Spares",
    image: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=400",
    updatedAt: "2026-06-30T06:30:00Z", // 30 mins ago
    rewardCoins: 3
  },
  {
    id: "p4",
    shopId: "guptastore",
    shopName: "Gupta Fertilizer & Oil Store",
    name: "Tractor Oil Filter (Heavy Duty)",
    price: 480,
    stockStatus: "Available",
    category: "Tractor Spares",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400",
    updatedAt: "2026-06-30T04:00:00Z", // 3 hours ago
    rewardCoins: 6
  },
  {
    id: "p5",
    shopId: "guptastore",
    shopName: "Gupta Fertilizer & Oil Store",
    name: "Mobil Super Engine Oil 15W-40 (5L)",
    price: 1850,
    stockStatus: "Available",
    category: "Lubricants",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400",
    updatedAt: "2026-06-30T06:00:00Z",
    rewardCoins: 20
  },
  {
    id: "p6",
    shopId: "guptastore",
    shopName: "Gupta Fertilizer & Oil Store",
    name: "12V Spray Pump Battery",
    price: 750,
    stockStatus: "Out of Stock",
    category: "Tools",
    image: "https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&q=80&w=400",
    updatedAt: "2026-06-28T09:00:00Z",
    rewardCoins: 10
  },
  {
    id: "p7",
    shopId: "haryanaspares",
    name: "Tractor Oil Filter (Standard)",
    shopName: "Haryana Agro Spares & Tools",
    price: 430,
    stockStatus: "Available",
    category: "Tractor Spares",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400",
    updatedAt: "2026-06-29T10:00:00Z",
    rewardCoins: 4
  },
  {
    id: "p8",
    shopId: "haryanaspares",
    name: "Heavy Duty Grease Gun",
    shopName: "Haryana Agro Spares & Tools",
    price: 550,
    stockStatus: "Likely Available",
    category: "Tools",
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=400",
    updatedAt: "2026-06-30T01:00:00Z",
    rewardCoins: 7
  }
];

export const mockCustomers = [
  {
    id: "c1",
    name: "Rahul Duhan",
    phone: "+919466778899",
    email: "rahul@example.com",
    superCoins: 15
  }
];

export const mockReservations = [
  {
    id: "DKS-8472",
    customerId: "c1",
    customerName: "Rahul Duhan",
    customerPhone: "+919466778899",
    shopId: "sharmaagro",
    shopName: "Sharma Agro & Tractor Spares",
    productId: "p1",
    productName: "Tractor Oil Filter (Mahindra/Sonalika)",
    price: 450,
    rewardCoins: 5,
    status: "reserved", // reserved, visited, confirmed, cancelled
    code: "DKS-8472",
    createdAt: "2026-06-30T06:15:00Z"
  }
];
