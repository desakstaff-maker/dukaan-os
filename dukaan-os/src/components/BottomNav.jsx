'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Home,
  User
} from 'lucide-react';



export default function BottomNav() {

  const pathname =
    usePathname();



  const tabs = [

    {
      name: 'Home',
      href: '/',
      icon: Home
    },

    
    {
      name: 'Account',
      href: '/account',
      icon: User
    }
  ];



  return (

    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop:
          '2px solid black',
        zIndex: 1000
      }}
    >

      <div
        style={{
          maxWidth: 700,
          margin: 'auto',
          display: 'grid',
          gridTemplateColumns:
            'repeat(2,1fr)',
          padding: '8px 0'
        }}
      >

        {
          tabs.map(
            tab => {

              const Icon =
                tab.icon;

              const active =
                pathname ===
                tab.href;

              return (

                <Link
                  key={tab.href}
                  href={tab.href}
                  style={{
                    display: 'flex',
                    flexDirection:
                      'column',
                    alignItems:
                      'center',
                    gap: 4,
                    color: active
                      ? '#6d28d9'
                      : '#64748b',
                    fontWeight:
                      active
                        ? 900
                        : 700,
                    padding:
                      '6px'
                  }}
                >

                  <Icon
                    size={22}
                  />

                  <span
                    style={{
                      fontSize:
                        11
                    }}
                  >
                    {tab.name}
                  </span>

                </Link>
              );
            }
          )
        }

      </div>

    </nav>
  );
}