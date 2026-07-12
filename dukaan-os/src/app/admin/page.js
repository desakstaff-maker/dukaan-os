'use client';

import {
  useEffect,
  useState
} from 'react';

import Header from '@/components/Header';
import Loading from '@/components/Loading';

import {

  getDashboardStats,

  getShops,
  createShop,
  updateShop,
  deleteShop,

  getProducts,
  updateProduct,
  deleteProduct,

  getReservations,
  updateReservation

} from '@/lib/db';

import {

  ADMIN

} from '@/lib/firebase';

import {

  slugify

} from '@/utils/helpers';



export default function AdminPage() {

  const [

    loading,

    setLoading

  ] = useState(
    true
  );



  const [

    authenticated,

    setAuthenticated

  ] = useState(
    false
  );



  const [

    password,

    setPassword

  ] = useState(
    ''
  );



  const [

    tab,

    setTab

  ] = useState(
    'shops'
  );



  const [

    stats,

    setStats

  ] = useState(
    {}
  );



  const [

    shops,

    setShops

  ] = useState(
    []
  );



  const [

    products,

    setProducts

  ] = useState(
    []
  );



  const [

    reservations,

    setReservations

  ] = useState(
    []
  );



  const [

    newShop,

    setNewShop

  ] = useState({

    name: '',

    owner: '',

    phone: '',

    whatsappNumber: '',

    whatsappEnabled: true,

    address: '',

    website: '',

    category:
      'others',

    plan:
      'FREE',

    lat:
      29.3152,

    lng:
      76.3150
  });
  useEffect(() => {

    if (
      authenticated
    ) {

      initialize();
    }

  }, [
    authenticated
  ]);



  async function initialize() {

    try {

      const [

        s,

        sh,

        p,

        r

      ] = await Promise.all([

        getDashboardStats(),

        getShops(),

        getProducts(),

        getReservations()
      ]);

      setStats(
        s
      );

      setShops(
        sh
      );

      setProducts(
        p
      );

      setReservations(
        r
      );

    } finally {

      setLoading(
        false
      );
    }
  }



  function login() {

    if (

      password ===

      ADMIN
        .PASSWORD

    ) {

      setAuthenticated(
        true
      );

      return;
    }

    alert(
      'Wrong password'
    );
  }



  async function addShop() {

    const slug =

      slugify(
        newShop.name
      );

    const token =

      Math.random()
        .toString(36)
        .substring(
          2,
          12
        );

    await createShop({

      ...newShop,

      slug,

      updateToken:
        token,

      whatsappNumber:

        newShop.whatsappNumber ||

        newShop.phone,

      whatsappEnabled:
        true,

      topPartner:

        newShop.plan ===
        'BUSINESS',

      monthlyBuyers:
        0
    });

    const sh =

      await getShops();

    setShops(
      sh
    );

    setNewShop({

      name: '',

      owner: '',

      phone: '',

      whatsappNumber: '',

      whatsappEnabled: true,

      address: '',

      website: '',

      category:
        'others',

      plan:
        'FREE',

      lat:
        29.3152,

      lng:
        76.3150
    });
  }
  async function saveShop(
    shop
  ) {

    await updateShop(

      shop.id,

      {

        name:
          shop.name,

        owner:
          shop.owner,

        phone:
          shop.phone,

        address:
          shop.address,

        website:
          shop.website,

        category:
          shop.category,

        plan:
          shop.plan,

        topPartner:

          shop.plan ===
          'BUSINESS',

        lat:
          Number(
            shop.lat
          ),

        lng:
          Number(
            shop.lng
          )
      }
    );

    alert(
      'Saved'
    );
  }



  async function removeShop(
    id
  ) {

    if (
      !confirm(
        'Delete shop?'
      )
    ) {

      return;
    }

    await deleteShop(
      id
    );

    setShops(

      shops.filter(
        s =>
          s.id !==
          id
      )
    );
  }



  async function saveProduct(
    product
  ) {

    await updateProduct(

      product.id,

      product
    );

    alert(
      'Saved'
    );
  }



  async function removeProduct(
    id
  ) {

    if (
      !confirm(
        'Delete product?'
      )
    ) {

      return;
    }

    await deleteProduct(
      id
    );

    setProducts(

      products.filter(
        p =>
          p.id !==
          id
      )
    );
  }
  async function updateReservationStatus(

    reservation,

    status

  ) {

    await updateReservation(

      reservation.id,

      {
        status
      }
    );

    setReservations(

      reservations.map(
        r =>

          r.id ===
            reservation.id

            ? {
              ...r,
              status
            }

            : r
      )
    );
  }



  if (
    !authenticated
  ) {

    return (

      <div className="
        page
      ">

        <Header
          showCoins={
            false
          }
        />

        <div className="
          container
        ">

          <h1
            className="
              mb-3
            "
          >

            Admin
            Login

          </h1>



          <input

            type="password"

            className="
              input
              mb-3
            "

            placeholder="
Admin Password"

            value={
              password
            }

            onChange={
              e =>
                setPassword(
                  e.target
                    .value
                )
            }
          />



          <button

            className="
              btn
              btn-primary
            "

            style={{
              width:
                '100%'
            }}

            onClick={
              login
            }
          >

            Login

          </button>

        </div>

      </div>
    );
  }



  if (
    loading
  ) {

    return (
      <Loading />
    );
  }
  return (

    <div className="
      page
    ">

      <Header
        showCoins={
          false
        }
      />



      <div className="
        container
      ">

        <div
          className="
            grid-2
            mb-3
          "
        >

          <div
            className="
              card
            "
            style={{
              padding:
                16
            }}
          >

            <strong>
              Shops
            </strong>

            <div
              className="
                text-large
                mt-1
              "
            >

              {
                stats
                  .totalShops
              }

            </div>

          </div>



          <div
            className="
              card
            "
            style={{
              padding:
                16
            }}
          >

            <strong>
              Products
            </strong>

            <div
              className="
                text-large
                mt-1
              "
            >

              {
                stats
                  .totalProducts
              }

            </div>

          </div>



          <div
            className="
              card
            "
            style={{
              padding:
                16
            }}
          >

            <strong>
              Customers
            </strong>

            <div
              className="
                text-large
                mt-1
              "
            >

              {
                stats
                  .totalCustomers
              }

            </div>

          </div>



          <div
            className="
              card
            "
            style={{
              padding:
                16
            }}
          >

            <strong>
              Reservations
            </strong>

            <div
              className="
                text-large
                mt-1
              "
            >

              {
                stats
                  .totalReservations
              }

            </div>

          </div>

        </div>



        <div
          className="
            flex
            gap-1
            mb-3
          "
        >

          <button
            className="btn"
            onClick={() =>
              setTab(
                'shops'
              )
            }
          >

            Shops

          </button>



          <button
            className="btn"
            onClick={() =>
              setTab(
                'products'
              )
            }
          >

            Products

          </button>



          <button
            className="btn"
            onClick={() =>
              setTab(
                'reservations'
              )
            }
          >

            Reservations

          </button>

        </div>
        {

          tab ===
          'shops' && (

            <>

              <div

                className="
                  card
                  mb-3
                "

                style={{
                  padding:
                    16
                }}
              >

                <h3
                  className="
                    mb-2
                  "
                >

                  Add
                  Shop

                </h3>



                <input
                  className="
                    input
                    mb-2
                  "
                  placeholder="
Shop Name"
                  value={
                    newShop.name
                  }
                  onChange={
                    e =>
                      setNewShop({
                        ...newShop,
                        name:
                          e.target
                            .value
                      })
                  }
                />



                <input
                  className="
                    input
                    mb-2
                  "
                  placeholder="
Owner"
                  value={
                    newShop.owner
                  }
                  onChange={
                    e =>
                      setNewShop({
                        ...newShop,
                        owner:
                          e.target
                            .value
                      })
                  }
                />



                <input
                  className="
                    input
                    mb-2
                  "
                  placeholder="
Phone"
                  value={
                    newShop.phone
                  }
                  onChange={
                    e =>
                      setNewShop({
                        ...newShop,
                        phone:
                          e.target
                            .value
                      })
                  }
                />
                <input

                  className="
    input
    mb-2
  "

                  placeholder="
WhatsApp Number"

                  value={
                    newShop.whatsappNumber
                  }

                  onChange={
                    e =>
                      setNewShop({

                        ...newShop,

                        whatsappNumber:
                          e.target.value

                      })
                  }

                />



                <input
                  className="
                    input
                    mb-2
                  "
                  placeholder="
Address"
                  value={
                    newShop.address
                  }
                  onChange={
                    e =>
                      setNewShop({
                        ...newShop,
                        address:
                          e.target
                            .value
                      })
                  }
                />



                <select
                  className="
                    input
                    mb-2
                  "
                  value={
                    newShop.plan
                  }
                  onChange={
                    e =>
                      setNewShop({
                        ...newShop,
                        plan:
                          e.target
                            .value
                      })
                  }
                >

                  <option value="FREE">
                    FREE
                  </option>

                  <option value="PRO">
                    PRO
                  </option>

                  <option value="BUSINESS">
                    BUSINESS
                  </option>

                </select>



                <button

                  className="
                    btn
                    btn-primary
                  "

                  style={{
                    width:
                      '100%'
                  }}

                  onClick={
                    addShop
                  }
                >

                  Add
                  Shop

                </button>

              </div>
              {
                shops.map(
                  shop => (

                    <div

                      key={
                        shop.id
                      }

                      className="
                        card
                        mb-2
                      "

                      style={{
                        padding:
                          16
                      }}
                    >

                      <div
                        className="
                          flex-between
                          mb-2
                        "
                      >

                        <strong>

                          {
                            shop.name
                          }

                        </strong>

                        <button

                          className="
                            btn
                          "

                          style={{
                            background:
                              '#fee2e2'
                          }}

                          onClick={() =>
                            removeShop(
                              shop.id
                            )
                          }
                        >

                          Delete

                        </button>

                      </div>



                      <div
                        className="
                          text-small
                          mb-1
                        "
                      >

                        Plan:
                        {' '}
                        {
                          shop.plan
                        }

                      </div>



                      <div
                        className="
                          text-small
                          mb-2
                        "
                      >

                        Update:
                        {' '}
                        /update/
                        {
                          shop.updateToken
                        }

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
                          saveShop(
                            shop
                          )
                        }
                      >

                        Save

                      </button>

                    </div>

                  )
                )
              }

            </>

          )
        }
        {

          tab ===
          'products' &&

          products.map(
            product => (

              <div

                key={
                  product.id
                }

                className="
                  card
                  mb-2
                "

                style={{
                  padding:
                    16
                }}
              >

                <div
                  className="
                    flex-between
                    mb-2
                  "
                >

                  <strong>

                    {
                      product.name
                    }

                  </strong>

                  <button

                    className="
                      btn
                    "

                    style={{
                      background:
                        '#fee2e2'
                    }}

                    onClick={() =>
                      removeProduct(
                        product.id
                      )
                    }
                  >

                    Delete

                  </button>

                </div>



                <div
                  className="
                    text-small
                    mb-1
                  "
                >

                  ₹
                  {
                    product.price
                  }

                </div>



                <div
                  className="
                    text-small
                    mb-2
                  "
                >

                  Stock:
                  {' '}
                  {
                    product.stock
                  }

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
                    saveProduct(
                      product
                    )
                  }
                >

                  Save

                </button>

              </div>

            )
          )
        }



        {

          tab ===
          'reservations' &&

          reservations.map(
            reservation => (

              <div

                key={
                  reservation.id
                }

                className="
                  card
                  mb-2
                "

                style={{
                  padding:
                    16
                }}
              >

                <div>

                  <strong>

                    {
                      reservation.productName
                    }

                  </strong>

                </div>



                <div
                  className="
                    text-small
                    mt-1
                  "
                >

                  {
                    reservation.customerName
                  }

                </div>



                <div
                  className="
                    text-small
                    mt-1
                  "
                >

                  Status:
                  {' '}
                  {
                    reservation.status
                  }

                </div>
                <div
                  className="
    text-small
    mt-1
  "
                >

                  Original Price:
                  {' '}
                  <strong>

                    ₹
                    {

                      reservation.originalPrice ??

                      reservation.price

                    }

                  </strong>

                </div>



                <div
                  className="
    text-small
    mt-1
  "
                >

                  Cash To Pay:
                  {' '}
                  <strong
                    style={{
                      color: '#16A34A'
                    }}
                  >

                    ₹
                    {

                      reservation.cashAmount ??

                      reservation.price

                    }

                  </strong>

                </div>



                {

                  Number(

                    reservation.coinsUsed ||

                    0

                  ) > 0 && (

                    <div
                      className="
        text-small
        mt-1
      "
                    >

                      SuperCoins Used:
                      {' '}

                      <strong
                        style={{
                          color: '#2563EB'
                        }}
                      >

                        {

                          reservation.coinsUsed

                        }

                      </strong>

                    </div>

                  )

                }



                <div
                  className="
    flex
    gap-1
    mt-2
  "
                >

                  {

                    reservation.status ===

                    'reserved' && (

                      <>

                        <button

                          className="
            btn
            btn-primary
          "

                          onClick={() =>
                            updateReservationStatus(

                              reservation,

                              'completed'

                            )
                          }

                        >

                          Confirm Purchase

                        </button>



                        <button

                          className="
            btn
          "

                          style={{

                            background: '#FEE2E2'

                          }}

                          onClick={() =>
                            updateReservationStatus(

                              reservation,

                              'cancelled'

                            )
                          }

                        >

                          Cancel

                        </button>

                      </>

                    )

                  }



                  {

                    reservation.status !==

                    'reserved' && (

                      <span

                        style={{

                          fontWeight: 700,

                          color:

                            reservation.status ===

                              'completed'

                              ? '#16A34A'

                              : '#DC2626'

                        }}

                      >

                        {

                          reservation.status ===

                            'completed'

                            ? '✅ Purchase Confirmed'

                            : '❌ Reservation Cancelled'

                        }

                      </span>

                    )

                  }

                </div>

              </div>

            )
          )
        }

      </div>

    </div>
  );
}