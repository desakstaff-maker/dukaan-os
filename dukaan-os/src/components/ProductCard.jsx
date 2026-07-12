'use client';

import Image from 'next/image';

import {
  MapPin,
  Coins,
  Package,
  Star
} from 'lucide-react';

import {
  calculateCoins
} from '@/utils/coins';



export default function ProductCard({

  product,

  shop,

  onReserve

}) {

  const coins =
    calculateCoins(

      product.price,

      shop?.plan
    );



  return (

    <div

      className="
        card
      "

      style={{

        overflow:
          'hidden',

        display:
          'flex',
        border:
          '2px solid #000000',

        flexDirection:
          'column'
      }}
    >

      <div

        style={{

          height:
            170,

          position:
            'relative',

          background:
            '#f8fafc'
        }}
      >

        <Image

          src={
            product.image ||

            '/placeholder.png'
          }

          alt={
            product.name
          }

          fill

          style={{

            objectFit:
              'cover',
            borderBottom:
              '2px solid #9d9898'
          }}
        />



        {

          (
            shop?.topPartner ||

            shop?.plan ===
            'BUSINESS'
          ) && (

            <img

              src="/top-partner.png"

              alt="Top Partner"

              style={{

                position:
                  'absolute',

                top:
                  8,

                left:
                  8,

                width:
                  75,

                height:
                  'auto',

                zIndex:
                  10,

                pointerEvents:
                  'none',

                filter:
                  'drop-shadow(0 4px 8px rgba(0,0,0,.15))'
              }}
            />

          )
        }





      </div>



      <div
        style={{
          padding:
            14
        }}
      >

        <h3

          style={{

            fontSize:
              16,

            fontWeight:
              900
          }}
        >

          {
            product.name
          }

        </h3>
        <div

          style={{

            marginTop: 10,

            marginBottom: 12

          }}

        >

          <div

            style={{

              fontSize: 24,

              fontWeight: 900,

              lineHeight: 1,

              color: '#111'

            }}

          >

            ₹{product.price}

          </div>



          {

            (product.customerCoins ?? 0) > 0 && (

              <div

                style={{

                  marginTop: 8,

                  display: 'inline-flex',

                  alignItems: 'center',

                  gap: 8,

                  padding: '7px 12px',

                  background: '#ECFDF5',

                  color: '#15803D',

                  border: '1px solid #BBF7D0',

                  borderRadius: 999,

                  fontWeight: 800,

                  fontSize: 14

                }}

              >

                <span>

                  🪙

                </span>

                <span>

                  Pay ₹{product.payPrice}

                </span>

                <span

                  style={{

                    opacity: .45

                  }}

                >

                  |

                </span>

                <span>

                  +

                  {

                    Math.min(

                      product.customerCoins,

                      product.maxCoins

                    )

                  }

                  {' '}

                  Coins

                </span>

              </div>

            )

          }

        </div>



        <div

          className="
            mt-1
            text-small
          "

          style={{

            display:
              'flex',

            alignItems:
              'center',

            gap: 5
          }}
        >

          <Package
            size={14}
          />

          {
            product.stock >
              0

              ? `${product.stock} available`

              : 'Out of stock'
          }

        </div>



        <div

          className="
            mt-1
            text-small
          "

          style={{

            display:
              'flex',

            alignItems:
              'center',

            gap: 5
          }}
        >

          <MapPin
            size={14}
          />

          {
            shop?.name
          }

        </div>



        {

          shop?.monthlyBuyers >

          0 && (

            <div

              className="
                mt-1
                text-small
              "

              style={{

                display:
                  'flex',

                alignItems:
                  'center',

                gap: 5
              }}
            >

              <Star
                size={14}
              />

              {
                shop.monthlyBuyers
              }

              monthly buyers

            </div>

          )
        }



        <div

          className="mt-2"

        >

          <div

            style={{

              display: 'flex',

              alignItems: 'center',

              gap: 6,

              color: '#00B050',

              fontWeight: 700

            }}

          >

            <Coins size={16} />

            Earn {coins} SuperCoins

          </div>

          

        </div>



        <button

          disabled={
            product.stock <=
            0
          }

          className="
            btn
            btn-primary
            mt-2
          "

          style={{

            width:
              '100%',

            opacity:

              product.stock <=
                0

                ? .5

                : 1
          }}

          onClick={() =>
            onReserve?.(
              product
            )
          }
        >

          {

            product.stock >
              0

              ? 'Reserve Now'

              : 'Out of Stock'
          }

        </button>

      </div>

    </div>
  );
}