'use client';

import {
  useEffect,
  useState
} from 'react';

import {
  X,
  Calendar,
  Clock,
  User,
  MapPin,
  Package
} from 'lucide-react';



export default function ReserveModal({

  open,

  product,

  customer,

  onClose,

  onReserve

}) {

  const [

    form,

    setForm

  ] = useState({

    quantity: 1,

    village: '',

    visitDate: '',

    visitTime: '',

    phone: ''
  });
  const maxCoins = Math.floor(
    (
      Number(product?.price || 0) *
      Number(form.quantity || 1)
    ) * 0.20
  );

  const availableCoins =
    customer?.superCoins || 0;

  const [coinsUsed, setCoinsUsed] = useState(0);

  useEffect(() => {

    setCoinsUsed(

      Math.min(

        availableCoins,

        maxCoins

      )

    );

  }, [

    availableCoins,

    maxCoins,

    form.quantity

  ]);

  const totalPrice =
    Number(
      product?.price || 0
    ) *
    Number(
      form.quantity || 1
    );

  const cashToPay =
    Math.max(
      0,
      totalPrice - coinsUsed
    );



  useEffect(() => {

    if (
      customer
    ) {

      setForm(

        prev => ({

          ...prev,

          village:
            customer.village ||
            '',

          phone:
            customer.phone ||
            ''
        })
      );
    }

  }, [
    customer
  ]);



  if (
    !open ||
    !product
  ) {

    return null;
  }



  const maxQty =

    Number(
      product.stock
    ) || 1;



  const total =

    Number(
      product.price
    ) *

    Number(
      form.quantity
    );



  return (

    <div

      style={{

        position:
          'fixed',

        inset: 0,

        background:
          'rgba(0,0,0,.6)',

        zIndex:
          9999,

        display:
          'flex',

        alignItems:
          'flex-end'
      }}
    >

      <div

        style={{

          width:
            '100%',

          background:
            '#fff',

          borderTopLeftRadius:
            20,

          borderTopRightRadius:
            20,

          padding:
            20,

          maxHeight:
            '90vh',

          overflow:
            'auto'
        }}
      >

        <div

          className="
            flex-between
            mb-2
          "
        >

          <h2>

            Reserve Product

          </h2>

          <button
            onClick={
              onClose
            }
          >

            <X
              size={22}
            />

          </button>

        </div>



        <div

          className="
            card
            mb-2
          "

          style={{
            padding:
              15
          }}
        >

          <div

            className="
              flex
              gap-1
            "
          >

            <Package
              size={18}
            />

            <strong>

              {
                product.name
              }

            </strong>

          </div>



          <div
            className="
              mt-1
            "
          >

            ₹
            {
              product.price
            }

          </div>



          <div
            className="
              mt-1
            "
          >

            Stock:
            {' '}
            {
              product.stock
            }

          </div>

        </div>



        <label>

          Quantity

        </label>

        <input

          type="number"

          min="1"

          max={
            maxQty
          }

          className="
            input
            mb-2
          "

          value={
            form.quantity
          }

          onChange={
            e =>
              setForm({

                ...form,

                quantity:
                  Math.min(

                    maxQty,

                    Math.max(
                      1,

                      Number(
                        e.target
                          .value
                      )
                    )
                  )
              })
          }
        />



        <label>

          Village/City

        </label>

        <div
          className="
            flex
            gap-1
            mb-2
          "
        >

          <MapPin
            size={18}
          />

          <input

            className="
              input
            "

            value={
              form.village
            }

            onChange={
              e =>
                setForm({

                  ...form,

                  village:
                    e.target
                      .value
                })
            }
          />

        </div>



        <label>

          Mobile Number

        </label>

        <div
          className="
            flex
            gap-1
            mb-2
          "
        >

          <User
            size={18}
          />

          <input

            className="
              input
            "

            value={
              form.phone
            }

            onChange={
              e =>
                setForm({

                  ...form,

                  phone:
                    e.target
                      .value
                })
            }
          />

        </div>



        <label>

          Visiting Date

        </label>

        <div
          className="
            flex
            gap-1
            mb-2
          "
        >

          <Calendar
            size={18}
          />

          <input

            type="date"

            className="
              input
            "

            value={
              form.visitDate
            }

            onChange={
              e =>
                setForm({

                  ...form,

                  visitDate:
                    e.target
                      .value
                })
            }
          />

        </div>



        <label>

          Visiting Time

        </label>

        <div
          className="
            flex
            gap-1
            mb-3
          "
        >

          <Clock
            size={18}
          />

          <input

            type="time"

            className="
              input
            "

            value={
              form.visitTime
            }

            onChange={
              e =>
                setForm({

                  ...form,

                  visitTime:
                    e.target
                      .value
                })
            }
          />

        </div>



        <div
          className="
    card
    mb-3
  "
          style={{
            padding: 18
          }}
        >

          <div
            className="flex-between mb-1"
          >

            <span>

              Original Price

            </span>

            <strong>

              ₹{totalPrice}

            </strong>

          </div>



          <div
            className="flex-between mb-1"
          >

            <span>

              Available SuperCoins

            </span>

            <strong>

              {availableCoins}

            </strong>

          </div>



          <div
            className="mb-2"
          >

            <label>

              Use SuperCoins

            </label>

            <input

              type="range"

              min={0}

              max={Math.min(

                availableCoins,

                maxCoins

              )}

              value={coinsUsed}

              onChange={e =>

                setCoinsUsed(

                  Number(

                    e.target.value

                  )

                )

              }

              style={{

                width: '100%',

                marginTop: 10

              }}

            />



            <div
              className="flex-between mt-1"
            >

              <span>

                0

              </span>

              <strong>

                {coinsUsed}

              </strong>

              <span>

                {

                  Math.min(

                    availableCoins,

                    maxCoins

                  )

                }

              </span>

            </div>

          </div>



          <div
            className="flex-between mb-1"
          >

            <span>

              SuperCoins Used

            </span>

            <strong>

              {coinsUsed}

            </strong>

          </div>



          <div
            className="flex-between"
          >

            <span>

              Cash To Pay

            </span>

            <strong
              style={{
                fontSize: 22
              }}
            >

              ₹{cashToPay}

            </strong>

          </div>



          <div
            className="
      mt-2
      text-small
      text-muted
    "
          >

            You can use up to 20% of the order value
            using SuperCoins.

          </div>



          <div
            className="
              mt-1
              text-small
              text-muted
            "
          >

            Reservation
            valid
            for
            24
            hours

          </div>

        </div>



        <button

          className="
            btn
            btn-primary
          "

          style={{
            width:
              '100%'
          }}

          onClick={() =>

            onReserve({

              ...form,

              originalPrice:
                totalPrice,

              cashAmount:
                cashToPay,

              coinsUsed:
                coinsUsed,

              maxCoinsAllowed:
                maxCoins

            })

          }
        >

          Confirm Reservation

        </button>

      </div>

    </div >
  );
}