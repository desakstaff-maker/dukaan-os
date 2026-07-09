import './globals.css';

export const metadata = {

  title:
    'Dukaan OS',

  description:
    'Hyperlocal Search Engine for Rural India',

  manifest:
    '/manifest.json',

  icons: {

    icon:
      '/logo.png',

    apple:
      '/logo.png'
  }
};



export const viewport = {

  width:
    'device-width',

  initialScale:
    1,

  maximumScale:
    1,

  userScalable:
    false,

  themeColor:
    '#6d28d9'
};



export default function RootLayout({

  children

}) {

  return (

    <html lang="en">

      <body>

        {children}

      </body>

    </html>
  );
}