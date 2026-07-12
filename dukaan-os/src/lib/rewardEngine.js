import {

    getCustomer,
    updateCustomer,

    addCoinHistory,

    createRewardCoupon,

    getCustomerRewardStats,
    updateCustomerRewardStats,

    getVIPLevels,
    getCustomerStreak,
    updateCustomerStreak,

    getWeeklyRewards,
    getSpinLevels,
    getScratchLevels,
    getMysteryRewards,
    getPhysicalRewards

} from './db';



// ======================================================
// CONSTANTS
// ======================================================

export const VIP = {

    BRONZE: 'BRONZE',

    SILVER: 'SILVER',

    GOLD: 'GOLD',

    PLATINUM: 'PLATINUM',

    DIAMOND: 'DIAMOND'

};



export const REWARD_TYPES = {

    COINS: 'COINS',

    COUPON: 'COUPON',

    PRODUCT: 'PRODUCT',

    VOUCHER: 'VOUCHER',

    MYSTERY: 'MYSTERY',

    SPIN: 'SPIN',

    SCRATCH: 'SCRATCH'

};



export const COUPON_STATUS = {

    ACTIVE: 'ACTIVE',

    USED: 'USED',

    EXPIRED: 'EXPIRED'

};



// ======================================================
// BASIC HELPERS
// ======================================================

export function random(

    min,

    max

) {

    return Math.floor(

        Math.random()

        *

        (

            max -

            min +

            1

        )

    )

        + min;

}



export function chance(

    percentage

) {

    return (

        Math.random()

        *

        100

    ) < percentage;

}



export function now() {

    return Date.now();

}



// ======================================================
// VIP CALCULATOR
// ======================================================

export function calculateVIP(

    totalSpent

) {

    if (

        totalSpent >= 100000

    ) {

        return VIP.DIAMOND;

    }



    if (

        totalSpent >= 50000

    ) {

        return VIP.PLATINUM;

    }



    if (

        totalSpent >= 20000

    ) {

        return VIP.GOLD;

    }



    if (

        totalSpent >= 5000

    ) {

        return VIP.SILVER;

    }



    return VIP.BRONZE;

}
// ======================================================
// CUSTOMER PROFILE
// ======================================================

export async function getRewardProfile(

    customerId

) {

    const [

        customer,

        stats,

        streak

    ] = await Promise.all([

        getCustomer(
            customerId
        ),

        getCustomerRewardStats(
            customerId
        ),

        getCustomerStreak(
            customerId
        )

    ]);

    return {

        customer,

        stats,

        streak

    };

}



// ======================================================
// STREAK
// ======================================================

export async function increaseStreak(

    customerId

) {

    const streak =
        await getCustomerStreak(
            customerId
        );

    if (

        !streak

    ) {

        await updateCustomerStreak(

            customerId,

            {

                current: 1,

                best: 1,

                updatedAt:
                    now()

            }

        );

        return 1;

    }

    const current =
        Number(
            streak.current || 0
        ) + 1;

    await updateCustomerStreak(

        customerId,

        {

            current,

            best:

                Math.max(

                    current,

                    Number(
                        streak.best || 0
                    )

                ),

            updatedAt:
                now()

        }

    );

    return current;

}



export async function resetStreak(

    customerId

) {

    await updateCustomerStreak(

        customerId,

        {

            current: 0,

            updatedAt:
                now()

        }

    );

}



// ======================================================
// VIP UPDATE
// ======================================================

export async function refreshVIP(

    customerId

) {

    const customer =
        await getCustomer(
            customerId
        );

    if (

        !customer

    ) {

        return null;

    }

    const level =
        calculateVIP(

            Number(

                customer.totalSpent ||

                0

            )

        );

    await updateCustomer(

        customerId,

        {

            vipLevel:
                level

        }

    );

    return level;

}
// ======================================================
// PERSONALIZED REWARD FILTER
// ======================================================

export function isRewardEligible(

    reward,

    customer

) {

    if (

        !reward ||

        !customer

    ) {

        return false;

    }



    if (

        reward.active === false

    ) {

        return false;

    }



    if (

        reward.gender &&

        reward.gender !== 'ALL' &&

        reward.gender !== customer.gender

    ) {

        return false;

    }



    if (

        reward.ageGroup &&

        reward.ageGroup !== 'ALL' &&

        reward.ageGroup !== customer.ageGroup

    ) {

        return false;

    }



    if (

        reward.vipLevel &&

        reward.vipLevel !== 'ALL' &&

        reward.vipLevel !== customer.vipLevel

    ) {

        return false;

    }



    if (

        reward.minCoins &&

        Number(

            customer.superCoins || 0

        ) <

        Number(

            reward.minCoins

        )

    ) {

        return false;

    }



    return true;

}



export function filterRewards(

    rewards,

    customer

) {

    return rewards.filter(

        reward =>

            isRewardEligible(

                reward,

                customer

            )

    );

}



// ======================================================
// PROBABILITY ENGINE
// ======================================================

export function chooseReward(

    rewards

) {

    if (

        !rewards ||

        rewards.length === 0

    ) {

        return null;

    }



    const totalWeight =

        rewards.reduce(

            (

                sum,

                reward

            ) =>

                sum +

                Number(

                    reward.weight ||

                    1

                ),

            0

        );



    let randomWeight =

        Math.random()

        *

        totalWeight;



    for (

        const reward

        of rewards

    ) {

        randomWeight -=

            Number(

                reward.weight ||

                1

            );



        if (

            randomWeight <= 0

        ) {

            return reward;

        }

    }



    return rewards[0];

}
// ======================================================
// WEEKLY GIFT ENGINE
// ======================================================

export async function getAvailableWeeklyGifts(

    customerId

) {

    const [

        customer,

        rewards

    ] = await Promise.all([

        getCustomer(
            customerId
        ),

        getWeeklyRewards()

    ]);

    return filterRewards(

        rewards,

        customer

    );

}



export async function claimWeeklyGift(

    customerId,

    reward

) {

    const customer =
        await getCustomer(
            customerId
        );

    if (

        !customer

    ) {

        throw new Error(

            'Customer not found'

        );

    }



    if (

        reward.type ===

        REWARD_TYPES.COINS

    ) {

        const amount =
            Number(

                reward.amount ||

                0

            );



        await updateCustomer(

            customerId,

            {

                superCoins:

                    Number(

                        customer.superCoins ||

                        0

                    )

                    +

                    amount

            }

        );



        await addCoinHistory({

            customerId,

            amount,

            type:
                'earned',

            reason:
                'Weekly Gift'

        });

    }



    else {

        await createRewardCoupon({

            customerId,

            rewardId:
                reward.id,

            title:
                reward.title,

            type:
                reward.type,

            status:
                COUPON_STATUS.ACTIVE,

            expiry:
                reward.expiry

        });

    }



    return true;

}
// ======================================================
// SPIN ENGINE
// ======================================================

export async function getSpinArena(

    customerId

) {

    const [

        customer,

        levels

    ] = await Promise.all([

        getCustomer(
            customerId
        ),

        getSpinLevels()

    ]);

    return {

        customer,

        levels:
            filterRewards(

                levels,

                customer

            )

    };

}



export async function playSpin(

    customerId,

    levelId

) {

    const [

        customer,

        levels

    ] = await Promise.all([

        getCustomer(
            customerId
        ),

        getSpinLevels()
    ]);



    const level =
        levels.find(

            l =>

                l.id ===
                levelId

        );



    if (

        !level

    ) {

        throw new Error(

            'Spin level not found'

        );

    }



    const cost =
        Number(

            level.coinCost ||

            0

        );



    if (

        Number(

            customer.superCoins ||

            0

        ) < cost

    ) {

        throw new Error(

            'Not enough SuperCoins'

        );

    }



    await updateCustomer(

        customerId,

        {

            superCoins:

                Number(

                    customer.superCoins

                )

                -

                cost

        }

    );



    await addCoinHistory({

        customerId,

        amount:
            cost,

        type:
            'spent',

        reason:
            'Spin'

    });



    const reward =
        chooseReward(

            level.rewards ||

            []

        );



    if (

        !reward

    ) {

        return null;

    }



    if (

        reward.type ===

        REWARD_TYPES.COINS

    ) {

        await updateCustomer(

            customerId,

            {

                superCoins:

                    Number(

                        customer.superCoins

                    )

                    -

                    cost

                    +

                    Number(

                        reward.amount ||

                        0

                    )

            }

        );



        await addCoinHistory({

            customerId,

            amount:
                Number(

                    reward.amount ||

                    0

                ),

            type:
                'earned',

            reason:
                'Spin Reward'

        });

    }

    else {

        await createRewardCoupon({

            customerId,

            rewardId:
                reward.id,

            title:
                reward.title,

            type:
                reward.type,

            status:
                COUPON_STATUS.ACTIVE,

            expiry:
                reward.expiry

        });

    }



    return reward;

}
// ======================================================
// SCRATCH CARD ENGINE
// ======================================================

export async function getScratchArena(

    customerId

) {

    const [

        customer,

        levels

    ] = await Promise.all([

        getCustomer(
            customerId
        ),

        getScratchLevels()

    ]);

    return {

        customer,

        levels:

            filterRewards(

                levels,

                customer

            )

    };

}



export async function playScratch(

    customerId,

    levelId

) {

    const [

        customer,

        levels

    ] = await Promise.all([

        getCustomer(
            customerId
        ),

        getScratchLevels()

    ]);



    const level =

        levels.find(

            l =>

                l.id ===
                levelId

        );



    if (

        !level

    ) {

        throw new Error(

            'Scratch level not found'

        );

    }



    const cost =

        Number(

            level.coinCost ||

            0

        );



    if (

        Number(

            customer.superCoins ||

            0

        ) < cost

    ) {

        throw new Error(

            'Not enough SuperCoins'

        );

    }



    await updateCustomer(

        customerId,

        {

            superCoins:

                Number(

                    customer.superCoins

                )

                -

                cost

        }

    );



    await addCoinHistory({

        customerId,

        amount:
            cost,

        type:
            'spent',

        reason:
            'Scratch Card'

    });



    const reward =

        chooseReward(

            level.rewards ||

            []

        );



    if (

        !reward

    ) {

        return null;

    }



    if (

        reward.type ===

        REWARD_TYPES.COINS

    ) {

        await updateCustomer(

            customerId,

            {

                superCoins:

                    Number(

                        customer.superCoins

                    )

                    -

                    cost

                    +

                    Number(

                        reward.amount ||

                        0

                    )

            }

        );



        await addCoinHistory({

            customerId,

            amount:

                Number(

                    reward.amount ||

                    0

                ),

            type:
                'earned',

            reason:
                'Scratch Reward'

        });

    }

    else {

        await createRewardCoupon({

            customerId,

            rewardId:
                reward.id,

            title:
                reward.title,

            type:
                reward.type,

            status:
                COUPON_STATUS.ACTIVE,

            expiry:
                reward.expiry

        });

    }



    return reward;

}
// ======================================================
// MYSTERY GIFT ENGINE
// ======================================================

export async function getMysteryArena(

    customerId

) {

    const [

        customer,

        gifts

    ] = await Promise.all([

        getCustomer(
            customerId
        ),

        getMysteryRewards()

    ]);

    return {

        customer,

        gifts:

            filterRewards(

                gifts,

                customer

            )

    };

}



export async function openMysteryGift(

    customerId,

    giftId

) {

    const [

        customer,

        gifts

    ] = await Promise.all([

        getCustomer(
            customerId
        ),

        getMysteryRewards()

    ]);



    const gift =

        gifts.find(

            g =>

                g.id ===
                giftId

        );



    if (

        !gift

    ) {

        throw new Error(

            'Mystery Gift not found'

        );

    }



    const cost =

        Number(

            gift.coinCost ||

            0

        );



    if (

        Number(

            customer.superCoins ||

            0

        ) < cost

    ) {

        throw new Error(

            'Not enough SuperCoins'

        );

    }



    await updateCustomer(

        customerId,

        {

            superCoins:

                Number(

                    customer.superCoins

                )

                -

                cost

        }

    );



    await addCoinHistory({

        customerId,

        amount:
            cost,

        type:
            'spent',

        reason:
            'Mystery Gift'

    });



    const reward =

        chooseReward(

            gift.rewards ||

            []

        );



    if (

        !reward

    ) {

        return null;

    }



    if (

        reward.type ===

        REWARD_TYPES.COINS

    ) {

        await updateCustomer(

            customerId,

            {

                superCoins:

                    Number(

                        customer.superCoins

                    )

                    -

                    cost

                    +

                    Number(

                        reward.amount ||

                        0

                    )

            }

        );



        await addCoinHistory({

            customerId,

            amount:

                Number(

                    reward.amount ||

                    0

                ),

            type:
                'earned',

            reason:
                'Mystery Gift Reward'

        });

    }

    else {

        await createRewardCoupon({

            customerId,

            rewardId:
                reward.id,

            title:
                reward.title,

            type:
                reward.type,

            status:
                COUPON_STATUS.ACTIVE,

            expiry:
                reward.expiry

        });

    }



    return reward;

}
// ======================================================
// PHYSICAL KHAJANA ENGINE
// ======================================================

export async function getPhysicalKhajana(

    customerId,

    shopId

) {

    const [

        customer,

        rewards

    ] = await Promise.all([

        getCustomer(
            customerId
        ),

        getPhysicalRewards()

    ]);



    return rewards.filter(

        reward =>

            isRewardEligible(

                reward,

                customer

            )

            &&

            reward.shopId ===

            shopId

    );

}



export async function redeemPhysicalReward(

    customerId,

    reward

) {

    const customer =
        await getCustomer(
            customerId
        );



    if (

        !customer

    ) {

        throw new Error(

            'Customer not found'

        );

    }



    const coins =
        Number(

            reward.coinCost ||

            0

        );



    if (

        Number(

            customer.superCoins ||

            0

        ) < coins

    ) {

        throw new Error(

            'Not enough SuperCoins'

        );

    }



    await updateCustomer(

        customerId,

        {

            superCoins:

                Number(

                    customer.superCoins

                )

                -

                coins

        }

    );



    await addCoinHistory({

        customerId,

        amount:
            coins,

        type:
            'spent',

        reason:
            reward.title

    });



    await createRewardCoupon({

        customerId,

        rewardId:
            reward.id,

        title:
            reward.title,

        type:
            reward.type,

        status:
            COUPON_STATUS.ACTIVE,

        expiry:
            reward.expiry,

        shopId:
            reward.shopId

    });



    return true;

}



// ======================================================
// CUSTOMER REWARD SUMMARY
// ======================================================

export async function getRewardSummary(

    customerId

) {

    const [

        customer,

        stats,

        streak

    ] = await Promise.all([

        getCustomer(
            customerId
        ),

        getCustomerRewardStats(
            customerId
        ),

        getCustomerStreak(
            customerId
        )

    ]);



    return {

        coins:

            customer?.superCoins ||

            0,



        vip:

            customer?.vipLevel ||

            VIP.BRONZE,



        streak:

            streak?.current ||

            0,



        stats

    };

}
// ======================================================
// DAILY LOGIN BONUS ENGINE
// ======================================================

export async function claimDailyLoginBonus(

    customerId

) {

    const customer =
        await getCustomer(
            customerId
        );

    if (

        !customer

    ) {

        throw new Error(

            'Customer not found'

        );

    }

    const today =
        new Date()
            .toDateString();

    if (

        customer.lastDailyReward ===
        today

    ) {

        return {

            claimed: false,

            reason:
                'Already claimed today'

        };

    }

    const streak =
        await increaseStreak(
            customerId
        );

    let rewardCoins =
        5;

    if (
        streak >= 7
    ) {

        rewardCoins =
            25;

    }

    else if (
        streak >= 3
    ) {

        rewardCoins =
            10;

    }

    await updateCustomer(

        customerId,

        {

            superCoins:

                Number(
                    customer.superCoins ||
                    0
                )

                +

                rewardCoins,

            lastDailyReward:
                today

        }

    );

    await addCoinHistory({

        customerId,

        amount:
            rewardCoins,

        type:
            'earned',

        reason:
            'Daily Login Bonus'

    });

    return {

        claimed: true,

        streak,

        rewardCoins

    };

}



// ======================================================
// REWARD EXPIRY CHECK
// ======================================================

export function isExpired(

    reward

) {

    if (

        !reward.expiry

    ) {

        return false;

    }

    return (

        new Date(

            reward.expiry

        ).getTime()

        <

        Date.now()

    );

}



// ======================================================
// REWARD STATUS
// ======================================================

export function getRewardStatus(

    reward

) {

    if (

        reward.used

    ) {

        return 'USED';

    }

    if (

        isExpired(
            reward
        )

    ) {

        return 'EXPIRED';

    }

    return 'ACTIVE';

}
// ======================================================
// MASTER REWARD DASHBOARD ENGINE
// ======================================================

export async function getRewardsHome(

    customerId,

    shopId = null

) {

    const [

        summary,

        weekly,

        spins,

        scratches,

        mystery,

        physical

    ] = await Promise.all([

        getRewardSummary(
            customerId
        ),

        getAvailableWeeklyGifts(
            customerId
        ),

        getSpinArena(
            customerId
        ),

        getScratchArena(
            customerId
        ),

        getMysteryArena(
            customerId
        ),

        shopId

            ?

            getPhysicalKhajana(

                customerId,

                shopId

            )

            :

            []

    ]);



    return {

        summary,

        weekly,

        spins,

        scratches,

        mystery,

        physical

    };

}



// ======================================================
// CUSTOMER REWARD INSIGHTS
// ======================================================

export function getRewardInsights(

    summary

) {

    const insights = [];



    if (

        summary.coins < 20

    ) {

        insights.push({

            type:

                'LOW_COINS',

            title:

                'Reserve more to earn SuperCoins.'

        });

    }



    if (

        summary.streak >= 7

    ) {

        insights.push({

            type:

                'STREAK',

            title:

                'Amazing! Your streak is active.'

        });

    }



    if (

        summary.vip ===

        VIP.DIAMOND

    ) {

        insights.push({

            type:

                'VIP',

            title:

                'Diamond Member Rewards Unlocked.'

        });

    }



    return insights;

}



// ======================================================
// REWARD ENGINE ENTRY
// ======================================================

const rewardEngine = {

    random,

    chance,

    now,



    calculateVIP,



    getRewardProfile,



    increaseStreak,

    resetStreak,



    refreshVIP,



    isRewardEligible,

    filterRewards,



    chooseReward,



    getAvailableWeeklyGifts,

    claimWeeklyGift,



    getSpinArena,

    playSpin,



    getScratchArena,

    playScratch,



    getMysteryArena,

    openMysteryGift,



    getPhysicalKhajana,

    redeemPhysicalReward,



    getRewardSummary,



    claimDailyLoginBonus,



    isExpired,

    getRewardStatus,



    getRewardsHome,



    getRewardInsights

};



export default rewardEngine;