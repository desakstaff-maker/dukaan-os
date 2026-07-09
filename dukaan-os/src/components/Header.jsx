'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Coins } from 'lucide-react';

export default function Header({

  title = 'Dukaan OS',

  superCoins = 0,

  showCoins = true

}) {

  return (

    <header
      className="
        sticky
        top-0
        z-50
        bg-white
        border-b-2
        border-black
      "
    >

      <div
        className="
          container
          flex-between
        "
      >

        <Link
          href="/"
          className="
            flex
            gap-1
            items-center
          "
        >

          <Image
            src="/logo.png"
            alt="Dukaan OS"
            width={40}
            height={40}
          />

          <div>

            <div
              style={{
                fontWeight: 900,
                fontSize: 18
              }}
            >
              {title}
            </div>

            <div
              className="
                text-small
                text-muted
              "
            >
              Hyperlocal Search
            </div>

          </div>

        </Link>



        {
          showCoins && (

            <Link
              href="/coins"
              className="
                card
                flex
                gap-1
                flex-center
              "
              style={{
                padding:
                  '8px 12px'
              }}
            >

              <Coins
                size={18}
                color="#f59e0b"
              />

              <span
                style={{
                  fontWeight: 900
                }}
              >
                {superCoins}
              </span>

            </Link>

          )
        }

      </div>

    </header>
  );
}