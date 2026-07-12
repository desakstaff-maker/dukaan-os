'use client';

import Link from 'next/link';
import Image from 'next/image';

import {
  Users,
  MapPin,
  Store
} from 'lucide-react';



export default function ShopCard({

  shop

}) {





  return (

    <Link
      href={`/shop/${shop.slug}`}
      className="
        card
      "
      style={{
        display:
          'block',
        border:
          '2px solid #000000',

        overflow:
          'hidden'
      }}
    >

      {/* Banner */}

      <div
        style={{
          height: 90,
          position: 'relative',
          borderBottom:
            '2px solid #4f4c4cb3',

          backgroundImage:
            `url(${shop.banner ||
            "/default-shop-banner.png"
            })`,

          backgroundSize:
            "cover",

          backgroundPosition:
            "center"
        }}
      >

        

      </div>



      {/* Logo */}

      <div
        style={{
          marginTop:
            -30,
          position:
            'relative',

          padding:
            '0 14px'
        }}
      >

        <div
          style={{
            width: 60,

            height: 60,

            border:
              '3px solid black',

            borderRadius:
              '50%',

            overflow:
              'hidden',

            background:
              '#fff'
          }}
        >

          <Image
            src={
              shop.logo ||
              '/default-shop-logo.png'
            }
            alt={
              shop.name
            }
            width={60}
            height={60}
            style={{
              width:
                '100%',

              height:
                '100%',

              objectFit:
                'cover'
            }}
          />

        </div>

      </div>



      {/* Details */}

      <div
        style={{
          padding:
            14
        }}
      >

        <h3
          style={{
            fontWeight:
              900,

            fontSize:
              18,

            marginBottom:
              6
          }}
        >

          {
            shop.name
          }

        </h3>



        <div
          className="
            text-small
            text-muted
            mb-2
          "
        >

          {
            shop.category
          }

        </div>



        <div
          className="
            flex
            gap-1
            mb-1
          "
          style={{
            alignItems:
              'center'
          }}
        >

          <Users
            size={15}
          />

          <span
            className="
              text-small
            "
          >

            {

              shop.monthlyBuyers ||
              0

            }

            {' '}
            monthly buyers

          </span>

        </div>



        <div
          className="
            flex
            gap-1
          "
          style={{
            alignItems:
              'center'
          }}
        >

          <MapPin
            size={15}
          />

          <span
            className="
              text-small
            "
          >

            {

              shop.distance
                ? `${shop.distance} km away`
                : shop.address

            }

          </span>

        </div>



        <button
          className="
            btn
            btn-primary
            mt-2
          "
          style={{
            width:
              '100%'
          }}
        >

          <Store
            size={16}
            style={{
              marginRight:
                6
            }}
          />

          Visit Shop

        </button>

      </div>

    </Link>
  );
}
