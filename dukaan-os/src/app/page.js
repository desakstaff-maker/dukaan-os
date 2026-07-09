'use client';

import {
  useEffect,
  useMemo,
  useState
} from 'react';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import ShopCard from '@/components/ShopCard';
import ReserveModal from '@/components/ReserveModal';
import Loading from '@/components/Loading';

import {
  getShops,
  getProducts,
  createReservation
} from '@/lib/db';

import {
  getCurrentUser
} from '@/lib/auth';

import {
  getPriority
} from '@/data/plans';



export default function HomePage() {

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    customer,
    setCustomer
  ] = useState(null);

  const [
    shops,
    setShops
  ] = useState([]);

  const [
    products,
    setProducts
  ] = useState([]);

  const [
    search,
    setSearch
  ] = useState('');

  const [
    filters,
    setFilters
  ] = useState({});

  const [
    selected,
    setSelected
  ] = useState(null);

  const [
    reserveOpen,
    setReserveOpen
  ] = useState(false);



  useEffect(() => {

    initialize();

  }, []);



  async function initialize() {

    try {

      const [
        s,
        p,
        c
      ] = await Promise.all([

        getShops(),

        getProducts(),

        getCurrentUser()
      ]);

      setShops(s);

      setProducts(p);

      setCustomer(c);

    } finally {

      setLoading(false);
    }
  }



  async function reserve(
    form
  ) {

    if (
      !customer
    ) {

      alert(
        'Please login first'
      );

      return;
    }
    try {

      const shop =
        shops.find(
          s =>
            s.id ===
            selected.shopId
        );

      await createReservation({

        customerId:
          customer.id,

        customerName:
          customer.name,

        customerPhone:
          form.phone,

        village:
          form.village,

        productId:
          selected.id,

        productName:
          selected.name,

        quantity:
          form.quantity,

        price:
          selected.price,

        visitDate:
          form.visitDate,

        visitTime:
          form.visitTime,

        shopId:
          selected.shopId,

        shopName:
          shop?.name
      });

      alert(
        'Reservation created successfully'
      );

      setReserveOpen(
        false
      );

    } catch (e) {

      alert(
        e.message
      );
    }
  }



  const results =
    useMemo(() => {

      const q =
        search
          .trim()
          .toLowerCase();

      if (!q) {

        return {

          products:
            [],

          shops:
            []
        };
      }



      const matchedProducts =

        products
          .filter(
            p =>

              p.name
                ?.toLowerCase()
                .includes(
                  q
                )
          )
          .sort(

            (a, b) =>

              a.name
                .toLowerCase()
                .indexOf(
                  q
                ) -

              b.name
                .toLowerCase()
                .indexOf(
                  q
                )
          );



      const matchedShops =

        shops
          .filter(
            s =>

              s.name
                ?.toLowerCase()
                .includes(
                  q
                )
          )
          .sort(

            (a, b) =>

              getPriority(
                b.plan
              ) -

              getPriority(
                a.plan
              )
          );
      return {

        products:
          matchedProducts,

        shops:
          matchedShops
      };

    }, [

      search,

      products,

      shops
    ]);



  if (
    loading
  ) {

    return (
      <Loading />
    );
  }



  const showProducts =

    results.products
      .length >=

    results.shops
      .length;



  return (

    <div className="
      page
      bottom-nav-space
    ">

      <Header
        superCoins={
          customer
            ?.superCoins
        }
      />



      <div className="
        container
      ">

        <SearchBar

          value={
            search
          }

          onChange={
            setSearch
          }

          filters={
            filters
          }

          onFiltersChange={
            setFilters
          }
        />


        {

          search && (

            <div
              className="
                section
              "
            >

              <div
                className="
                  section-title
                "
              >

                Search
                Results

              </div>



              {

                showProducts

                  ? (

                    <div
                      className="
                      grid-2
                    "
                    >

                      {
                        results
                          .products

                          .filter(

                            p => {

                              if (

                                filters
                                  .category &&

                                p.category !==
                                filters
                                  .category

                              ) {

                                return false;
                              }

                              if (

                                filters
                                  .stock ===
                                'available'

                              ) {

                                return (
                                  p.stock >
                                  0
                                );
                              }

                              if (

                                filters
                                  .stock ===
                                'out'

                              ) {

                                return (
                                  p.stock <=
                                  0
                                );
                              }

                              return true;
                            }
                          )
                          .map(
                            product => (

                              <ProductCard

                                key={
                                  product.id
                                }

                                product={{

                                  ...product,

                                  customerCoins:

                                    customer?.superCoins ||

                                    0,

                                  maxCoins:

                                    Math.floor(

                                      Number(product.price) *

                                      0.20

                                    ),

                                  payPrice:

                                    Number(product.price) -

                                    Math.min(

                                      customer?.superCoins ||

                                      0,

                                      Math.floor(

                                        Number(product.price) *

                                        0.20

                                      )

                                    )

                                }}

                                shop={
                                  shops.find(
                                    s =>
                                      s.id ===
                                      product.shopId
                                  )
                                }

                                onReserve={
                                  p => {

                                    setSelected(
                                      p
                                    );

                                    setReserveOpen(
                                      true
                                    );
                                  }
                                }
                              />

                            )
                          )
                      }

                    </div>

                  )

                  : (

                    <div>

                      {
                        results
                          .shops

                          .filter(

                            shop => {

                              if (

                                filters
                                  .category &&

                                shop.category !==
                                filters
                                  .category

                              ) {

                                return false;
                              }

                              if (

                                filters
                                  .plan &&

                                shop.plan !==
                                filters
                                  .plan

                              ) {

                                return false;
                              }

                              return true;
                            }
                          )

                          .map(
                            shop => (

                              <div
                                key={
                                  shop.id
                                }

                                className="
                                mb-2
                              "
                              >

                                <ShopCard
                                  shop={
                                    shop
                                  }
                                />

                              </div>

                            )
                          )
                      }

                    </div>

                  )
              }

            </div>

          )
        }
        {

          !search && (

            <>

              <div
                className="
                  section
                "
              >

                <div
                  className="
                    section-title
                  "
                >

                  Top Partners

                </div>



                <div
                  className="
                    grid-2
                  "
                >

                  {
                    shops

                      .filter(

                        s =>

                          s.topPartner ||

                          s.plan ===
                          'BUSINESS'
                      )

                      .sort(

                        (a, b) =>

                          b.monthlyBuyers -

                          a.monthlyBuyers
                      )

                      .slice(
                        0,
                        6
                      )

                      .map(
                        shop => (

                          <ShopCard

                            key={
                              shop.id
                            }

                            shop={
                              shop
                            }
                          />

                        )
                      )
                  }

                </div>

              </div>



              <div
                className="
                  section
                "
              >

                <div
                  className="
                    section-title
                  "
                >

                  Trending Products

                </div>



                <div
                  className="
                    grid-2
                  "
                >

                  {
                    products

                      .filter(

                        p =>

                          p.stock >
                          0
                      )

                      .slice(
                        0,
                        8
                      )

                      .map(
                        product => (

                          <ProductCard

                            key={
                              product.id
                            }

                            product={{

                              ...product,

                              customerCoins:

                                customer?.superCoins ||

                                0,

                              maxCoins:

                                Math.floor(

                                  Number(product.price) *

                                  0.20

                                ),

                              payPrice:

                                Number(product.price) -

                                Math.min(

                                  customer?.superCoins ||

                                  0,

                                  Math.floor(

                                    Number(product.price) *

                                    0.20

                                  )

                                )

                            }}

                            shop={
                              shops.find(
                                s =>
                                  s.id ===
                                  product.shopId
                              )
                            }

                            onReserve={
                              p => {

                                setSelected(
                                  p
                                );

                                setReserveOpen(
                                  true
                                );
                              }
                            }
                          />

                        )
                      )
                  }

                </div>

              </div>


            </>

          )
        }



        <ReserveModal
          open={reserveOpen}
          product={selected}
          customer={customer}
          onClose={() =>
            setReserveOpen(false)
          }
          onReserve={reserve}
        />

      </div>

      <BottomNav />

    </div>
  );
}