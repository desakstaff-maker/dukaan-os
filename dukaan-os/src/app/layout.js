import './globals.css';

export const metadata = {
  title: 'Dukaan OS - Hyperlocal Search & Shop Websites',
  description: 'Instantly search local shops, verify stock, reserve products, and earn SuperCoins in Jind and Haryana.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        
        {/* Leaflet CSS */}
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-slate-50 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-[480px] min-h-screen bg-white shadow-xl flex flex-col relative overflow-hidden pb-16">
          {children}
        </div>
      </body>
    </html>
  );
}
