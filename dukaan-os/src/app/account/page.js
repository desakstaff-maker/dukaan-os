'use client';

import {
  useEffect,
  useState
} from 'react';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Loading from '@/components/Loading';

import {

  signup,
  login,
  logout,
  getCurrentUser

} from '@/lib/auth';

import {

  getReservationsByCustomer

} from '@/lib/db';

import {

  formatDate

} from '@/utils/helpers';



export default function AccountPage() {

  const [

    loading,

    setLoading

  ] = useState(
    true
  );



  const [

    user,

    setUser

  ] = useState(
    null
  );



  const [

    page,

    setPage

  ] = useState(
    'login'
  );



  const [

    reservations,

    setReservations

  ] = useState(
    []
  );
  const [
    ageGroup,
    setAgeGroup
  ] = useState('');

  const [
    gender,
    setGender
  ] = useState('');



  const [

    form,

    setForm

  ] = useState({

    name: '',

    phone: '',

    village: '',

    pin: '',

    confirmPin: '',

    gender: '',

    ageGroup: '',

    rememberDevice:
      true
  });



  useEffect(() => {

    initialize();

  }, []);



  async function initialize() {

    try {

      const current =
        await getCurrentUser();

      if (
        current
      ) {

        setUser(
          current
        );

        const data =

          await getReservationsByCustomer(
            current.id
          );

        setReservations(
          data
        );

        setPage(
          'account'
        );
      }

    }

    finally {

      setLoading(
        false
      );
    }
  }



  async function handleSignup() {

    if (

      form.pin.length !==
      4

    ) {

      return alert(
        'PIN must be 4 digits'
      );
    }

    if (

      form.pin !==
      form.confirmPin

    ) {

      return alert(
        'PIN mismatch'
      );
    }

    try {

      const customer =

        await signup(
          form
        );

      setUser(
        customer
      );

      setPage(
        'success'
      );

      setTimeout(

        () =>
          setPage(
            'account'
          ),

        3000
      );

    } catch (e) {

      alert(
        e.message
      );
    }
  }
  async function handleLogin() {

    try {

      const customer =

        await login(

          form.phone,

          form.pin,

          form.rememberDevice
        );

      setUser(
        customer
      );

      const data =

        await getReservationsByCustomer(
          customer.id
        );

      setReservations(
        data
      );

      setPage(
        'account'
      );

    } catch (e) {

      alert(
        e.message
      );
    }
  }



  function handleLogout() {

    logout();

    setUser(
      null
    );

    setReservations(
      []
    );

    setPage(
      'login'
    );
  }



  if (
    loading
  ) {

    return (
      <Loading />
    );
  }



  // ===================================
  // SUCCESS
  // ===================================

  if (
    page ===
    'success'
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
              100
          }}
        >

          <div
            style={{
              fontSize:
                80
            }}
          >

            🎉

          </div>

          <h1
            className="
              mt-2
            "
          >

            Signup
            Successful

          </h1>

          <p
            className="
              mt-2
              text-muted
            "
          >

            Redirecting
            to account...

          </p>

        </div>

      </div>
    );
  }



  // ===================================
  // ACCOUNT
  // ===================================

  if (

    page ===
    'account' &&

    user

  ) {

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
              card
            "
            style={{
              padding:
                20
            }}
          >

            <h2>

              {
                user.name
              }

            </h2>

            <div
              className="
                mt-1
                text-muted
              "
            >

              {
                user.phone
              }

            </div>

            <div
              className="
                mt-1
                text-muted
              "
            >

              {
                user.village
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

              Reservation
              History

            </div>



            {
              reservations
                .length ===
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
                  reservations
                  yet

                </div>

              )
            }



            {
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

                    <div
                      className="
                        flex-between
                        mb-1
                      "
                    >

                      <strong>

                        {
                          reservation.productName
                        }

                      </strong>

                      <span

                        className={

                          reservation.status ===
                            'completed'

                            ? 'badge badge-success'

                            : reservation.status ===
                              'cancelled_not_visited'

                              ? 'badge badge-danger'

                              : 'badge'
                        }
                      >

                        {
                          reservation.status
                        }

                      </span>

                    </div>



                    <div
                      className="
                        text-small
                        text-muted
                      "
                    >

                      {
                        reservation.shopName
                      }

                    </div>



                    <div
                      className="
                        mt-1
                      "
                    >

                      Ticket:
                      {' '}
                      <strong>

                        {
                          reservation.ticketId
                        }

                      </strong>

                    </div>



                    <div
                      className="
                        mt-1
                      "
                    >

                      Quantity:
                      {' '}
                      {
                        reservation.quantity
                      }

                    </div>



                    <div
                      className="
                        mt-1
                      "
                    >

                      Visit:
                      {' '}
                      {
                        reservation.visitDate
                      }
                      {' '}
                      {
                        reservation.visitTime
                      }

                    </div>



                    <div
                      className="
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



                    {

                      Number(

                        reservation.coinsUsed ||

                        0

                      ) > 0 && (

                        <div
                          className="
        mt-1
      "
                        >

                          SuperCoins Used:
                          {' '}

                          <strong
                            style={{
                              color: '#2563eb'
                            }}
                          >

                            -

                            {

                              reservation.coinsUsed

                            }

                            {' '}

                            SuperCoins

                          </strong>

                        </div>

                      )

                    }



                    <div
                      className="
    mt-1
  "
                    >

                      Cash Paid:
                      {' '}

                      <strong
                        style={{
                          color: '#16a34a'
                        }}
                      >

                        ₹
                        {

                          reservation.cashAmount ??

                          reservation.price

                        }

                      </strong>

                    </div>



                    <div
                      className="
    mt-1
  "
                    >

                      Earned:
                      {' '}

                      <strong
                        style={{
                          color: '#16a34a'
                        }}
                      >

                        +

                        {

                          reservation.rewardCoins

                        }

                        {' '}

                        SuperCoins

                      </strong>

                    </div>



                    {

                      reservation.status ===

                      'cancelled' && (

                        <div

                          style={{

                            marginTop: 14,

                            padding: 14,

                            borderRadius: 12,

                            background: '#FEF2F2',

                            border: '1px solid #FCA5A5'

                          }}

                        >

                          <div

                            style={{

                              fontWeight: 700,

                              color: '#B91C1C'

                            }}

                          >

                            Reservation cancelled by shopkeeper.

                          </div>

                          <div

                            style={{

                              marginTop: 6,

                              fontSize: 13

                            }}

                          >

                            Think this was a mistake?

                          </div>

                          <a

                            href={`tel:${reservation.shopPhone || ''}`}

                            style={{

                              display: 'inline-block',

                              marginTop: 10,

                              color: '#2563EB',

                              fontWeight: 700,

                              textDecoration: 'none'

                            }}

                          >

                            📞 Call Shopkeeper

                          </a>

                        </div>

                      )

                    }

                  </div>

                )
              )
            }

          </div>
          <div
            className="
              section
            "
          >

            <button

              className="
                btn
              "

              style={{

                width:
                  '100%',

                background:
                  '#fee2e2'
              }}

              onClick={
                handleLogout
              }
            >

              Logout

            </button>

          </div>

        </div>

        <BottomNav />

      </div>
    );
  }



  // ===================================
  // SIGNUP PAGE
  // ===================================

  if (
    page ===
    'signup'
  ) {

    return (

      <div className="page">

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

            Create Account

          </h1>



          <input

            className="
              input
              mb-2
            "

            placeholder="
Full Name"

            value={
              form.name
            }

            onChange={
              e =>
                setForm({

                  ...form,

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
Mobile Number"

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



          <input

            className="
              input
              mb-3
            "

            placeholder="
Village / City"

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
              setPage(
                'pin'
              )
            }
          >

            Continue

          </button>

        </div>

      </div>
    );
  }
  // ===================================
  // PIN PAGE
  // ===================================

  if (
    page ===
    'pin'
  ) {

    return (

      <div className="page">

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

            Create
            4 Digit PIN

          </h1>



          <input

            type="password"

            maxLength={4}

            className="
              input
              mb-2
            "

            placeholder="
Enter PIN"

            value={
              form.pin
            }

            onChange={
              e =>
                setForm({

                  ...form,

                  pin:
                    e.target
                      .value
                })
            }
          />



          <input

            type="password"

            maxLength={4}

            className="
              input
              mb-2
            "

            placeholder="
Confirm PIN"

            value={
              form.confirmPin
            }

            onChange={
              e =>
                setForm({

                  ...form,

                  confirmPin:
                    e.target
                      .value
                })
            }
          />
          <div
            style={{
              fontSize: 13,
              color: '#666',
              marginBottom: 16
            }}
          >

            🔒 This information is private
            and is only used to personalize
            your rewards and offers.
            It will never be shown publicly.

          </div>
          <div className="mb-2">

            <label>

              Age Group

            </label>

            <select

              className="input"

              value={ageGroup}

              onChange={e =>
                setAgeGroup(
                  e.target.value
                )
              }
            >

              <option value="">
                Select Age Group
              </option>

              <option value="under18">
                Under 18
              </option>

              <option value="18-24">
                18–24
              </option>

              <option value="25-34">
                25–34
              </option>

              <option value="35-44">
                35–44
              </option>

              <option value="45-59">
                45–59
              </option>

              <option value="60plus">
                60+
              </option>

            </select>

          </div>
          <div className="mb-2">

            <label>

              Gender

            </label>

            <select

              className="input"

              value={gender}

              onChange={e =>
                setGender(
                  e.target.value
                )
              }
            >

              <option value="">
                Select Gender
              </option>

              <option value="male">
                Male
              </option>

              <option value="female">
                Female
              </option>

              <option value="prefer_not">
                Prefer not to say
              </option>

            </select>

          </div>

          <div
            className="
              flex
              gap-1
              mb-3
            "
          >

            <input

              type="checkbox"

              checked={
                form.rememberDevice
              }

              onChange={
                e =>
                  setForm({

                    ...form,

                    rememberDevice:
                      e.target
                        .checked
                  })
              }
            />

            <span>

              Remember
              this
              device

            </span>

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

            onClick={
              handleSignup
            }
          >

            Create
            Account

          </button>

        </div>

      </div>
    );
  }



  // ===================================
  // LOGIN PAGE
  // ===================================

  return (

    <div className="page">

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

          Login

        </h1>



        <input

          className="
            input
            mb-2
          "

          placeholder="
Mobile Number"

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



        <input

          type="password"

          maxLength={4}

          className="
            input
            mb-2
          "

          placeholder="
4 Digit PIN"

          value={
            form.pin
          }

          onChange={
            e =>
              setForm({

                ...form,

                pin:
                  e.target
                    .value
              })
          }
        />



        <div
          className="
            flex
            gap-1
            mb-3
          "
        >

          <input

            type="checkbox"

            checked={
              form.rememberDevice
            }

            onChange={
              e =>
                setForm({

                  ...form,

                  rememberDevice:
                    e.target
                      .checked
                })
            }
          />

          <span>

            Remember
            me

          </span>

        </div>



        <button

          className="
            btn
            btn-primary
            mb-2
          "

          style={{
            width:
              '100%'
          }}

          onClick={
            handleLogin
          }
        >

          Login

        </button>



        <button

          className="
            btn
          "

          style={{
            width:
              '100%'
          }}

          onClick={() =>
            setPage(
              'signup'
            )
          }
        >

          Create
          New
          Account

        </button>

      </div>

    </div>
  );
}