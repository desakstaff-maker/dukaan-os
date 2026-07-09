'use client';

import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  useParams
} from 'next/navigation';

import Header from '@/components/Header';
import Loading from '@/components/Loading';
import ProductCard from '@/components/ProductCard';
import ReserveModal from '@/components/ReserveModal';
import ReviewCard from '@/components/ReviewCard';

import {

  getShopBySlug,
  getProductsByShop,
  getReviewsByShop,

  createReservation,
  addReview

} from '@/lib/db';

import {

  getCurrentUser

} from '@/lib/auth';



export default function ShopPage() {

  const {
    slug
  } = useParams();



  const [

    loading,

    setLoading

  ] = useState(
    true
  );



  const [

    customer,

    setCustomer

  ] = useState(
    null
  );



  const [

    shop,

    setShop

  ] = useState(
    null
  );



  const [

    products,

    setProducts

  ] = useState(
    []
  );



  const [

    reviews,

    setReviews

  ] = useState(
    []
  );



  const [

    selected,

    setSelected

  ] = useState(
    null
  );



  const [

    reserveOpen,

    setReserveOpen

  ] = useState(
    false
  );



  const [

    rating,

    setRating

  ] = useState(
    5
  );



  const [

    reviewText,

    setReviewText

  ] = useState(
    ''
  );



  useEffect(() => {

    initialize();

  }, [
    slug
  ]);



  async function initialize() {

    try {

      const s =

        await getShopBySlug(
          slug
        );

      if (
        !s
      ) {

        setLoading(
          false
        );

        return;
      }

      setShop(
        s
      );



      const [

        p,

        r,

        c

      ] = await Promise.all([

        getProductsByShop(
          s.id
        ),

        getReviewsByShop(
          s.id
        ),

        getCurrentUser()
      ]);



      setProducts(
        p
      );

      setReviews(
        r
      );

      setCustomer(
        c
      );

    } finally {

      setLoading(
        false
      );
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

        originalPrice:
          Number(
            selected.price
          ) *
          Number(
            form.quantity
          ),

        cashAmount:
          form.cashAmount,

        coinsUsed:
          form.coinsUsed,

        rewardCoins:
          Math.floor(

            (
              Number(
                selected.price
              ) *

              Number(
                form.quantity
              )

            ) / 100

          ),

        visitDate:
          form.visitDate,

        visitTime:
          form.visitTime,

        shopId:
          shop.id,

        shopName:
          shop.name
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



  async function submitReview() {

    if (
      !customer
    ) {

      alert(
        'Please login first'
      );

      return;
    }



    if (
      !reviewText.trim()
    ) {

      alert(
        'Write a review'
      );

      return;
    }



    const review = {

      shopId:
        shop.id,

      customerId:
        customer.id,

      customerName:
        customer.name,

      rating,

      text:
        reviewText,

      createdAt:
        Date.now()
    };



    await addReview(
      review
    );



    setReviews([

      {
        ...review,

        id:
          Date.now()
      },

      ...reviews
    ]);



    setReviewText(
      ''
    );

    setRating(
      5
    );



    alert(
      'Review added'
    );
  }



  const averageRating =

    useMemo(() => {

      if (
        !reviews.length
      ) {

        return '0.0';
      }

      return (

        reviews.reduce(

          (
            a,
            b
          ) =>

            a +
            b.rating,

          0

        ) /

        reviews.length

      ).toFixed(1);

    }, [
      reviews
    ]);



  if (
    loading
  ) {

    return (
      <Loading />
    );
  }



  if (
    !shop
  ) {

    return (

      <div className="page">

        <Header
          showCoins={
            false
          }
        />

        <div
          className="
            container
            text-center
          "
          style={{
            paddingTop:
              120
          }}
        >

          <h2>

            Shop
            not
            found

          </h2>

        </div>

      </div>
    );
  }
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

        {/* ==========================
             PREMIUM HERO
        ========================== */}

        <div

          style={{

            position:
              'relative',

            height:
              160,

            borderRadius:
              28,

            overflow:
              'hidden',

            backgroundImage:
              `
               url(${shop.banner ||
              '/default-shop-banner.png'
              })`,

            backgroundSize:
              'cover',

            backgroundPosition:
              'topcenter',

            boxShadow:
              '0 20px 50px rgba(0,0,0,.15)'
          }}
        >

          <img

            src={
              shop.logo ||
              '/default-shop-logo.png'
            }

            alt=""

            style={{

              position:
                'absolute',

              left:
                5,

              bottom:
                5,

              width:
                80,

              height:
                80,

              borderRadius:
                '50%',

              border:
                '2px solid black',

              background:
                '#fff',

              objectFit:
                'cover',

              boxShadow:
                '0 15px 40px rgba(0,0,0,.25)'
            }}
          />



          {

            (
              shop.topPartner ||

              shop.plan ===
              'BUSINESS'
            ) && (

              <img

                src="/top-partner.png"

                alt=""

                style={{

                  position:
                    'absolute',

                  right:
                    260,

                  top:
                    60,
                  transform: 'rotate(32deg)',

                  width:
                    70
                }}
              />

            )
          }

        </div>



        <div
          style={{
            paddingTop:
              45
          }}
        >

          <h1
            style={{

              margin: 0,

              fontSize:
                'clamp(28px,7vw,42px)',

              fontWeight:
                800
            }}
          >

            {
              shop.name
            }

          </h1>



          <div

            style={{

              color:
                '#666',

              marginTop:
                6
            }}
          >

            {
              shop.owner
            }

          </div>



          <div

            style={{

              display:
                'flex',

              gap:
                10,

              flexWrap:
                'wrap',

              marginTop:
                18
            }}
          >

            <div
              className="
                shop-pill
              "
            >

              📍
              {' '}
              {
                shop.address
              }

            </div>



            <div
              className="
                shop-pill
              "
            >

              📞
              {' '}
              {
                shop.phone
              }

            </div>



            <div
              className="
                shop-pill
              "
            >

              ⭐
              {' '}
              {
                averageRating
              }

            </div>

          </div>

        </div>



        {/* ==========================
             STATS
        ========================== */}




        {/* ==========================
             PRODUCTS
        ========================== */}

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

            Products

          </div>



          {

            products.length ===
            0 && (

              <div
                className="
                  card
                "
                style={{
                  padding:
                    30,

                  textAlign:
                    'center'
                }}
              >

                No
                products
                available

              </div>

            )
          }



          <div
            className="
              grid-2
            "
          >

            {
              products.map(
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
                      shop
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


        <div
          className="
            grid-2
            mt-3
            mb-3
          "
        >

          <div
            className="
              card
            "
            style={{
              padding:
                20
            }}
          >

            <div
              style={{
                fontSize:
                  30
              }}
            >

              👥

            </div>

            <h2>

              {
                shop.monthlyBuyers ||
                0
              }

            </h2>

            Monthly
            Buyers

          </div>



          <div
            className="
              card
            "
            style={{
              padding:
                20
            }}
          >

            <div
              style={{
                fontSize:
                  30
              }}
            >

              📦

            </div>

            <h2>

              {
                products.length
              }

            </h2>

            Products

          </div>



          <div
            className="
              card
            "
            style={{
              padding:
                20
            }}
          >

            <div
              style={{
                fontSize:
                  30
              }}
            >

              ⭐

            </div>

            <h2>

              {
                averageRating
              }

            </h2>

            Rating

          </div>



          <div
            className="
              card
            "
            style={{
              padding:
                20
            }}
          >

            <div
              style={{
                fontSize:
                  30
              }}
            >

              🪙

            </div>

            <h2>

              {
                shop.plan
              }

            </h2>

            Membership

          </div>

        </div>

        {/* ==========================
             REVIEW FORM
        ========================== */}

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

            Reviews

          </div>



          <div

            className="
              card
              mb-3
            "

            style={{
              padding:
                20
            }}
          >

            <h3>

              Write
              Review

            </h3>



            <select

              className="
                input
                mb-2
              "

              value={
                rating
              }

              onChange={
                e =>
                  setRating(
                    Number(
                      e.target
                        .value
                    )
                  )
              }
            >

              <option value={5}>
                ⭐⭐⭐⭐⭐
              </option>

              <option value={4}>
                ⭐⭐⭐⭐
              </option>

              <option value={3}>
                ⭐⭐⭐
              </option>

              <option value={2}>
                ⭐⭐
              </option>

              <option value={1}>
                ⭐
              </option>

            </select>



            <textarea

              className="
                input
                mb-2
              "

              rows={4}

              placeholder="
Write your experience..."

              value={
                reviewText
              }

              onChange={
                e =>
                  setReviewText(
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

              onClick={
                submitReview
              }
            >

              Submit
              Review

            </button>

          </div>
          {

            reviews.length ===
            0 && (

              <div
                className="
                  card
                "
                style={{
                  padding:
                    30,

                  textAlign:
                    'center'
                }}
              >

                No reviews yet

              </div>

            )
          }



          {
            reviews.map(
              review => (

                <div
                  key={
                    review.id
                  }

                  className="
                    mb-2
                  "
                >

                  <ReviewCard
                    review={
                      review
                    }
                  />

                </div>

              )
            )
          }

        </div>



        {/* ==========================
             SHOP INFORMATION
        ========================== */}

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

            Shop Information

          </div>



          <div

            className="
              card
            "

            style={{
              padding:
                24
            }}
          >

            <div
              className="
                mb-2
              "
            >

              <strong>
                Category:
              </strong>

              {' '}

              {
                shop.category
              }

            </div>



            <div
              className="
                mb-2
              "
            >

              <strong>
                Membership:
              </strong>

              {' '}

              {
                shop.plan
              }

            </div>



            <div
              className="
                mb-2
              "
            >

              <strong>
                Monthly Buyers:
              </strong>

              {' '}

              {
                shop.monthlyBuyers ||
                0
              }

            </div>



            <div
              className="
                mb-2
              "
            >

              <strong>
                Total Products:
              </strong>

              {' '}

              {
                products.length
              }

            </div>



            {

              shop.website && (

                <div>

                  <strong>
                    Website:
                  </strong>

                  {' '}

                  <a
                    href={
                      shop.website
                    }
                    target="_blank"
                    rel="noreferrer"
                  >

                    {
                      shop.website
                    }

                  </a>

                </div>

              )
            }

          </div>

        </div>



        {/* ==========================
             WHY RESERVE
        ========================== */}

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

            Why Reserve Here?

          </div>



          <div

            className="
              card
            "

            style={{
              padding:
                24
            }}
          >

            <div
              className="
                mb-2
              "
            >

              ✅ Reserve before visiting

            </div>



            <div
              className="
                mb-2
              "
            >

              ✅ Earn SuperCoins

            </div>



            <div
              className="
                mb-2
              "
            >

              ✅ View availability

            </div>



            <div
              className="
                mb-2
              "
            >

              ✅ Get reservation ticket

            </div>



            <div>

              ✅ Support local business

            </div>

          </div>

        </div>



        {/* ==========================
             RESERVE MODAL
        ========================== */}

        <ReserveModal

          open={
            reserveOpen
          }

          product={
            selected
          }

          customer={
            customer
          }

          onClose={() =>
            setReserveOpen(
              false
            )
          }

          onReserve={
            reserve
          }
        />

      </div>

    </div>
  );
}