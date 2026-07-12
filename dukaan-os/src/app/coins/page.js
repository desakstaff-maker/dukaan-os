'use client';

import {
  useEffect,
  useState
} from 'react';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Loading from '@/components/Loading';

import {
  getCurrentUser
} from '@/lib/auth';

import {
  getCoinHistory
} from '@/lib/db';

import {
  coinsToRupees,
  formatCoins
} from '@/utils/coins';

import {
  formatDate
} from '@/utils/helpers';

import {
  Coins,
  Wallet,
  TrendingUp
} from 'lucide-react';



export default function CoinsPage() {

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    user,
    setUser
  ] = useState(null);

  const [
    history,
    setHistory
  ] = useState([]);




  useEffect(() => {

    initialize();

  }, []);




  async function initialize() {

    try {

      const customer =
        await getCurrentUser();

      setUser(
        customer
      );

      if (
        customer
      ) {

        const coins =
          await getCoinHistory(
            customer.id
          );

        setHistory(
          coins
        );
      }

    } finally {

      setLoading(
        false
      );
    }
  }



  if (
    loading
  ) {

    return (
      <Loading />
    );
  }



  if (
    !user
  ) {

    return (

      <div className="page">

        <Header
          showCoins={false}
        />

        <div
          className="
            container
            text-center
          "
          style={{
            paddingTop:
              100
          }}
        >

          <h2>

            Please login
            first

          </h2>

        </div>

      </div>
    );
  }
  const totalEarned =

    history

      .filter(
        h =>
          h.type ===
          'earned'
      )

      .reduce(

        (a, b) =>

          a +
          Number(
            b.amount ||
            0
          ),

        0
      );



  const totalSpent =

    history

      .filter(
        h =>
          h.type ===
          'spent'
      )

      .reduce(

        (a, b) =>

          a +
          Number(
            b.amount ||
            0
          ),

        0
      );



  return (

    <div className="
      page
      bottom-nav-space
    ">

      <Header
        superCoins={
          user.superCoins
        }
      />



      <div className="
        container
      ">

        <div

          className="
    primary-card
    mb-3
  "

          style={{

            padding: 24

          }}

        >

          <div

            className="
      flex-between
    "

          >

            <div>

              <div

                style={{

                  fontSize: 30,

                  fontWeight: 900

                }}

              >

                🪙 SuperCoins

              </div>

              <div

                style={{

                  marginTop: 4,

                  opacity: .7

                }}

              >

                Use up to 20% of any reservation.

              </div>

            </div>



            <div

              style={{

                textAlign: 'right'

              }}

            >

              <div

                style={{

                  fontSize: 42,

                  fontWeight: 900

                }}

              >

                {

                  formatCoins(

                    user.superCoins

                  )

                }

              </div>

              <div>

                Available

              </div>

            </div>

          </div>



          <div

            style={{

              marginTop: 22,

              borderTop: '1px solid rgba(255,255,255,.25)',

              paddingTop: 18

            }}

          >

            <div

              style={{

                fontWeight: 700,

                marginBottom: 10

              }}

            >

              Current Buying Power

            </div>

            <div

              style={{

                fontSize: 24,

                fontWeight: 900

              }}

            >

              ₹

              {

                coinsToRupees(

                  user.superCoins

                )

              }

            </div>

            <div

              style={{

                opacity: .75,

                marginTop: 6

              }}

            >

              Automatically usable up to
              20% of every reservation.

            </div>

          </div>

        </div>



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

            <div
              className="
                flex
                gap-1
              "
            >

              <TrendingUp
                size={20}
              />

              <strong>

                Earned

              </strong>

            </div>



            <div
              className="
                text-large
                mt-2
              "
            >

              {
                totalEarned
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

            <div
              className="
                flex
                gap-1
              "
            >

              <Wallet
                size={20}
              />

              <strong>

                Spent

              </strong>

            </div>



            <div
              className="
                text-large
                mt-2
              "
            >

              {
                totalSpent
              }

            </div>

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

            Coin History

          </div>
          <div

            className="card mb-3"

            style={{

              padding: 18,

              borderLeft: '5px solid #16A34A'

            }}

          >

            <div

              style={{

                fontWeight: 800,

                marginBottom: 10,

                fontSize: 18

              }}

            >

              How SuperCoins Work

            </div>

            <div

              style={{

                lineHeight: 1.8,

                color: '#555'

              }}

            >

              • Earn <strong>1 SuperCoin</strong> for every
              ₹100 successful purchase.

              <br /><br />

              • While reserving a product,
              you can use SuperCoins to pay
              up to <strong>20%</strong> of the
              order value.

              <br /><br />

              • You decide how many
              SuperCoins to use during
              reservation checkout.

              <br /><br />

              • Remaining amount is paid
              directly to the shop.

            </div>

          </div>



          {
            history.length ===
            0 && (

              <div
                className="
                  card
                "
                style={{
                  padding:
                    20,

                  textAlign:
                    'center'
                }}
              >

                No
                transactions

              </div>

            )
          }



          {
            history.map(
              item => (

                <div

                  key={
                    item.id
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
                    "
                  >

                    <strong>

                      {
                        item.reason ||
                        'Transaction'
                      }

                    </strong>



                    <span

                      style={{

                        color:

                          item.type ===
                            'earned'

                            ? '#16a34a'

                            : '#dc2626',

                        fontWeight:
                          900
                      }}
                    >

                      {

                        item.type ===
                          'earned'

                          ? '+'

                          : '-'
                      }

                      {
                        item.amount
                      }

                    </span>

                  </div>



                  <div
                    className="
                      mt-1
                      text-small
                      text-muted
                    "
                  >

                    Type:
                    {' '}
                    {
                      item.type
                    }

                  </div>



                  <div
                    className="
                      mt-1
                      text-small
                      text-muted
                    "
                  >

                    {
                      item.createdAt

                        ? formatDate(
                          item.createdAt
                        )

                        : '-'
                    }

                  </div>

                </div>

              )
            )
          }

        </div>

      </div>



      <BottomNav />

    </div>
  );
}