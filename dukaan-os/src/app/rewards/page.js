'use client';

import {
    useEffect,
    useMemo,
    useState
} from 'react';

import Header from '@/components/Header';

import WeeklyRewards from '@/components/rewards/WeeklyRewards';
import SpinArena from '@/components/rewards/SpinArena';
import ScratchArena from '@/components/rewards/ScratchArena';
import MysteryArena from '@/components/rewards/MysteryArena';
import PhysicalKhajana from '@/components/rewards/PhysicalKhajana';
import RewardHistory from '@/components/rewards/RewardHistory';

import {
    getCurrentUser
} from '@/lib/auth';

import {
    getRewardsHome
} from '@/lib/rewardEngine';

export default function RewardsPage() {

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        customer,
        setCustomer
    ] = useState(null);

    const [
        rewards,
        setRewards
    ] = useState(null);

    const [
        activeTab,
        setActiveTab
    ] = useState('rewards');

    const tabs = useMemo(
        () => [
            {
                id: 'rewards',
                title: 'Rewards'
            },
            {
                id: 'khajana',
                title: 'Physical Khajana'
            }
        ],
        []
    );

    useEffect(() => {
        initialize();
    }, []);

    async function initialize() {

        try {

            const user =
                await getCurrentUser();

            setCustomer(user);

            if (!user) {

                setLoading(false);

                return;

            }

            const data =
                await getRewardsHome(
                    user.id
                );

            setRewards(data);

        }

        finally {

            setLoading(false);

        }

    }

    if (loading) {

        return (

            <div className="page">

                <Header />

            </div>

        );

    }

    if (!customer) {

        return (

            <div className="page">

                <Header />

            </div>

        );

    }

    const summary =
        rewards?.summary || {};

    return (

        <div className="page">

            <Header
                superCoins={
                    customer.superCoins
                }
            />

            <div className="container">

                <div
                    className="card"
                    style={{
                        padding: 28,
                        borderRadius: 28,
                        overflow: 'hidden',
                        background:
                            'linear-gradient(135deg,#FFD54F,#FFB300)'
                    }}
                >

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >

                        <div>

                            <div
                                style={{
                                    fontSize: 36,
                                    fontWeight: 900
                                }}
                            >

                                SuperCoins

                            </div>

                            <div
                                style={{
                                    marginTop: 6,
                                    opacity: .75,
                                    fontWeight: 600
                                }}
                            >

                                Rewards Hub

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

                                {customer.superCoins}

                            </div>

                            <div>

                                Available

                            </div>

                        </div>

                    </div>

                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: 12,
                        marginTop: 24,
                        marginBottom: 24
                    }}
                >

                    {

                        tabs.map(

                            tab => (

                                <button

                                    key={tab.id}

                                    className={
                                        activeTab === tab.id
                                            ? 'btn btn-primary'
                                            : 'btn'
                                    }

                                    onClick={() =>
                                        setActiveTab(tab.id)
                                    }

                                >

                                    {tab.title}

                                </button>

                            )

                        )

                    }

                </div>

                {

                    activeTab === 'rewards'

                    &&

                    <>
                        <WeeklyRewards

                            customer={customer}

                            rewards={
                                rewards?.weekly || []
                            }

                            summary={summary}

                            refresh={initialize}

                        />



                        <div
                            className="card"
                            style={{

                                padding: 24,

                                marginTop: 28,

                                marginBottom: 28,

                                borderRadius: 28

                            }}
                        >

                            <div
                                style={{

                                    display: 'flex',

                                    justifyContent: 'space-between',

                                    alignItems: 'center',

                                    marginBottom: 20

                                }}
                            >

                                <div>

                                    <div
                                        style={{

                                            fontSize: 28,

                                            fontWeight: 900

                                        }}
                                    >

                                        Your Progress

                                    </div>

                                    <div
                                        style={{

                                            opacity: .65,

                                            marginTop: 5

                                        }}
                                    >

                                        Keep reserving to unlock
                                        premium rewards.

                                    </div>

                                </div>

                                <div
                                    style={{

                                        textAlign: 'right'

                                    }}
                                >

                                    <div
                                        style={{

                                            fontWeight: 900,

                                            fontSize: 24

                                        }}
                                    >

                                        {

                                            summary.vip ||

                                            'BRONZE'

                                        }

                                    </div>

                                    VIP

                                </div>

                            </div>



                            <div
                                style={{

                                    height: 14,

                                    background: '#ECECEC',

                                    borderRadius: 999,

                                    overflow: 'hidden'

                                }}
                            >

                                <div
                                    style={{

                                        width:

                                            `${Math.min(

                                                summary?.stats
                                                    ?.completedReservations ||

                                                0,

                                                100

                                            )}%`,

                                        height: '100%',

                                        background:
                                            'linear-gradient(90deg,#FFD54F,#FF9800)',

                                        transition: '.4s'

                                    }}
                                />

                            </div>



                            <div
                                style={{

                                    marginTop: 12,

                                    fontWeight: 700

                                }}
                            >

                                {

                                    summary?.stats
                                        ?.completedReservations ||

                                    0

                                }

                                {' '}

                                Completed Reservations

                            </div>

                        </div>



                        <SpinArena

                            customer={customer}

                            levels={

                                rewards?.spins?.levels ||

                                []

                            }

                            summary={summary}

                            refresh={initialize}

                        />



                        <ScratchArena

                            customer={customer}

                            levels={

                                rewards?.scratches?.levels ||

                                []

                            }

                            summary={summary}

                            refresh={initialize}

                        />



                        <MysteryArena

                            customer={customer}

                            gifts={

                                rewards?.mystery?.gifts ||

                                []

                            }

                            summary={summary}

                            refresh={initialize}

                        />



                        <RewardHistory

                            customer={customer}

                            mode="transactions"

                            refresh={initialize}

                        />

                    </>
                }
                {

                    activeTab === 'khajana'

                    &&

                    <>

                        <div

                            className="card"

                            style={{

                                padding: 28,

                                borderRadius: 28,

                                marginBottom: 28

                            }}

                        >

                            <div

                                style={{

                                    display: 'flex',

                                    justifyContent: 'space-between',

                                    alignItems: 'center',

                                    marginBottom: 18

                                }}

                            >

                                <div>

                                    <div

                                        style={{

                                            fontSize: 30,

                                            fontWeight: 900

                                        }}

                                    >

                                        Physical Khajana

                                    </div>



                                    <div

                                        style={{

                                            marginTop: 6,

                                            opacity: .65

                                        }}

                                    >

                                        Redeem rewards from shops

                                        you actually purchase from.

                                    </div>

                                </div>



                                <div

                                    style={{

                                        fontSize: 46

                                    }}

                                >

                                    🏆

                                </div>

                            </div>



                            <PhysicalKhajana

                                customer={customer}

                                rewards={

                                    rewards?.physical ||

                                    []

                                }

                                refresh={initialize}

                            />

                        </div>



                        <div

                            className="card"

                            style={{

                                padding: 28,

                                borderRadius: 28

                            }}

                        >

                            <div

                                style={{

                                    fontSize: 24,

                                    fontWeight: 900,

                                    marginBottom: 20

                                }}

                            >

                                Coming Soon

                            </div>



                            <div

                                className="grid-2"

                            >

                                <div

                                    className="card"

                                >

                                    <h3>

                                        Discount Store

                                    </h3>



                                    <p>

                                        Amazon

                                        Flipkart

                                        Myntra

                                        Meesho

                                        Affiliate Rewards

                                    </p>

                                </div>



                                <div

                                    className="card"

                                >

                                    <h3>

                                        Festival Rewards

                                    </h3>



                                    <p>

                                        Limited Time

                                        Premium Rewards

                                        Exclusive Coupons

                                    </p>

                                </div>

                            </div>

                        </div>

                    </>
                    <div

                    className="card"

                    style={{

                        padding: 28,

                        marginTop: 30,

                        borderRadius: 28

                    }}

                >

                    <div

                        style={{

                            fontSize: 28,

                            fontWeight: 900,

                            marginBottom: 20

                        }}

                    >

                        Reward Tips

                    </div>



                    <ul

                        style={{

                            lineHeight: 2,

                            paddingLeft: 22

                        }}

                    >

                        <li>

                            Reserve products regularly.

                        </li>



                        <li>

                            Maintain your weekly streak.

                        </li>



                        <li>

                            Unlock higher VIP levels.

                        </li>



                        <li>

                            Save coins for premium rewards.

                        </li>



                        <li>

                            Partner shops unlock exclusive gifts.

                        </li>



  

  ewards become available

  profile grows.

  

  

  
  

  

  
}







