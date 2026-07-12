import {
    collection,
    getCountFromServer,
    runTransaction,
    increment,
    writeBatch,
    Timestamp,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,

    query,
    where,
    orderBy,
    limit,

    serverTimestamp

} from 'firebase/firestore';
import {

    reservationTicket

} from '@/config/whatsapp';
import {

    db,
    COLLECTIONS,
    RESERVATION_STATUS,
    SHOP_PLANS,
    generateTicketId,
    calculateReward

} from './firebase';



// ======================================================
// HELPERS
// ======================================================

function normalizeDoc(
    snapshot
) {

    return {

        id:
            snapshot.id,

        ...snapshot.data()
    };
}



function normalizeArray(
    snapshots
) {

    return snapshots.docs.map(
        normalizeDoc
    );
}



// ======================================================
// SHOPS
// ======================================================

export async function getShops() {

    const snap =
        await getDocs(

            collection(
                db,
                COLLECTIONS.shops
            )
        );

    return normalizeArray(
        snap
    );
}



export async function getShop(
    id
) {

    const snap =
        await getDoc(

            doc(
                db,
                COLLECTIONS.shops,
                id
            )
        );

    if (
        !snap.exists()
    ) {

        return null;
    }

    return normalizeDoc(
        snap
    );
}



export async function getShopBySlug(
    slug
) {

    const q = query(

        collection(
            db,
            COLLECTIONS.shops
        ),

        where(
            'slug',
            '==',
            slug
        ),

        limit(1)
    );

    const snap =
        await getDocs(q);

    if (
        snap.empty
    ) {

        return null;
    }

    return normalizeDoc(
        snap.docs[0]
    );
}



export async function createShop(
    data
) {

    return addDoc(

        collection(
            db,
            COLLECTIONS.shops
        ),

        {

            ...data,

            createdAt:
                serverTimestamp(),

            monthlyBuyers:
                data.monthlyBuyers ||
                0,

            topPartner:
                data.topPartner ||
                false
        }
    );
}



export async function updateShop(

    id,

    data

) {

    return updateDoc(

        doc(
            db,
            COLLECTIONS.shops,
            id
        ),

        data
    );
}



export async function deleteShop(
    id
) {

    return deleteDoc(

        doc(
            db,
            COLLECTIONS.shops,
            id
        )
    );
}
// ======================================================
// PRODUCTS
// ======================================================

export async function getProducts() {

    const snap =
        await getDocs(

            collection(
                db,
                COLLECTIONS.products
            )
        );

    return normalizeArray(
        snap
    );
}



export async function getProduct(
    id
) {

    const snap =
        await getDoc(

            doc(
                db,
                COLLECTIONS.products,
                id
            )
        );

    if (
        !snap.exists()
    ) {

        return null;
    }

    return normalizeDoc(
        snap
    );
}



export async function getProductsByShop(
    shopId
) {

    const q = query(

        collection(
            db,
            COLLECTIONS.products
        ),

        where(
            'shopId',
            '==',
            shopId
        )
    );

    const snap =
        await getDocs(q);

    return normalizeArray(
        snap
    );
}



export async function createProduct(
    data
) {

    return addDoc(

        collection(
            db,
            COLLECTIONS.products
        ),

        {

            ...data,

            stock:
                Number(
                    data.stock
                ) || 0,

            price:
                Number(
                    data.price
                ) || 0,

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()
        }
    );
}



export async function updateProduct(

    id,

    data

) {

    return updateDoc(

        doc(
            db,
            COLLECTIONS.products,
            id
        ),

        {

            ...data,

            updatedAt:
                serverTimestamp()
        }
    );
}



export async function deleteProduct(
    id
) {

    return deleteDoc(

        doc(
            db,
            COLLECTIONS.products,
            id
        )
    );
}
// ======================================================
// RESERVATIONS
// ======================================================
export async function createReservation(
    data
) {

    const rewardCoins =
        calculateReward(

            Number(
                data.originalPrice ||
                data.price
            )

        );

    const ticketId =
        reservationTicket(
            generateTicketId()
        );

    return addDoc(

        collection(
            db,
            COLLECTIONS.reservations
        ),

        {

            ...data,

            quantity:
                Number(
                    data.quantity
                ),

            price:
                Number(
                    data.price
                ),

            originalPrice:
                Number(
                    data.originalPrice ||
                    data.price
                ),

            cashAmount:
                Number(
                    data.cashAmount ||
                    data.price
                ),

            coinsUsed:
                Number(
                    data.coinsUsed ||
                    0
                ),

            rewardCoins,

            ticketId,

            status:
                RESERVATION_STATUS
                    .RESERVED,

            rewardGiven:
                false,

            createdAt:
                serverTimestamp()

        }
    );
}

export async function getReservations() {

    const snap =
        await getDocs(

            collection(
                db,
                COLLECTIONS
                    .reservations
            )
        );

    return normalizeArray(
        snap
    );
}



export async function getReservation(
    id
) {

    const snap =
        await getDoc(

            doc(
                db,
                COLLECTIONS
                    .reservations,
                id
            )
        );

    if (
        !snap.exists()
    ) {

        return null;
    }

    return normalizeDoc(
        snap
    );
}



export async function getReservationsByCustomer(
    customerId
) {

    const q = query(

        collection(
            db,
            COLLECTIONS
                .reservations
        ),

        where(
            'customerId',
            '==',
            customerId
        )
    );

    const snap =
        await getDocs(q);

    return normalizeArray(
        snap
    );
}



export async function getReservationsByShop(
    shopId
) {

    const q = query(

        collection(
            db,
            COLLECTIONS
                .reservations
        ),

        where(
            'shopId',
            '==',
            shopId
        )
    );

    const snap =
        await getDocs(q);

    return normalizeArray(
        snap
    );
}



export async function updateReservation(
    id,
    data
) {

    const reservationRef =
        doc(
            db,
            COLLECTIONS.reservations,
            id
        );

    const reservationSnap =
        await getDoc(
            reservationRef
        );

    if (
        !reservationSnap.exists()
    ) {
        throw new Error(
            'Reservation not found'
        );
    }

    const reservation =
        reservationSnap.data();

    await updateDoc(
        reservationRef,
        data
    );

    if (
        data.status ===
        'completed' &&

        !reservation.rewardGiven
    ) {

        const reward =
            Number(
                reservation
                    .rewardCoins ||
                0
            );
        const coinsUsed =
            Number(
                reservation
                    .coinsUsed ||
                0
            );

        if (

            coinsUsed >

            0

        ) {

            await spendCoins(

                reservation
                    .customerId,

                coinsUsed,

                `Used on ${reservation.productName}`

            );

        }

        if (
            reward > 0
        ) {

            const customerRef =
                doc(
                    db,
                    COLLECTIONS.customers,
                    reservation
                        .customerId
                );

            const customerSnap =
                await getDoc(
                    customerRef
                );

            if (
                customerSnap.exists()
            ) {

                const customer =
                    customerSnap
                        .data();

                await updateDoc(
                    customerRef,
                    {
                        superCoins:
                            Number(
                                customer
                                    .superCoins ||
                                0
                            ) + reward
                    }
                );

                await addDoc(
                    collection(
                        db,
                        COLLECTIONS
                            .coinHistory
                    ),
                    {
                        customerId:
                            reservation
                                .customerId,

                        amount:
                            reward,

                        type:
                            'earned',

                        reason:
                            reservation
                                .productName,

                        reservationId:
                            id,

                        createdAt:
                            serverTimestamp()
                    }
                );

                await updateDoc(
                    reservationRef,
                    {
                        rewardGiven:
                            true
                    }
                );
            }
        }
    }
}
// ======================================================
// REVIEWS
// ======================================================
export async function getReservationByTicket(

    ticketId

) {

    const q = query(

        collection(

            db,

            COLLECTIONS.reservations

        ),

        where(

            'ticketId',

            '==',

            ticketId

        ),

        limit(1)

    );



    const snap =

        await getDocs(q);



    if (snap.empty)

        return null;



    return {

        id:

            snap.docs[0].id,

        ...snap.docs[0].data()

    };

}



export async function confirmReservationByTicket(

    ticketId

) {

    const reservation =

        await getReservationByTicket(

            ticketId

        );



    if (!reservation)

        return null;



    if (

        reservation.status ===

        RESERVATION_STATUS.CONFIRMED

    ) {

        return 'ALREADY_CONFIRMED';

    }



    if (

        reservation.status ===

        RESERVATION_STATUS.CANCELLED

    ) {

        return 'ALREADY_CANCELLED';

    }



    await updateReservation(

        reservation.id,

        {

            status:

                RESERVATION_STATUS.CONFIRMED

        }

    );



    return reservation;

}



export async function cancelReservationByTicket(

    ticketId

) {

    const reservation =

        await getReservationByTicket(

            ticketId

        );



    if (!reservation)

        return null;



    if (

        reservation.status ===

        RESERVATION_STATUS.CANCELLED

    ) {

        return 'ALREADY_CANCELLED';

    }



    if (

        reservation.status ===

        RESERVATION_STATUS.CONFIRMED

    ) {

        return 'ALREADY_CONFIRMED';

    }



    await updateReservation(

        reservation.id,

        {

            status:

                RESERVATION_STATUS.CANCELLED

        }

    );



    return reservation;

}
export async function createReview(
    data
) {

    return addDoc(

        collection(
            db,
            COLLECTIONS.reviews
        ),

        {

            ...data,

            rating:
                Number(
                    data.rating
                ),

            createdAt:
                serverTimestamp()
        }
    );
}
export const addReview = createReview;


export async function getReviews() {

    const snap =
        await getDocs(

            collection(
                db,
                COLLECTIONS.reviews
            )
        );

    return normalizeArray(
        snap
    );
}



export async function getReviewsByShop(
    shopId
) {

    const q = query(

        collection(
            db,
            COLLECTIONS.reviews
        ),

        where(
            'shopId',
            '==',
            shopId
        ),

        orderBy(
            'createdAt',
            'desc'
        )
    );

    const snap =
        await getDocs(q);

    return normalizeArray(
        snap
    );
}



export async function getReviewsByCustomer(
    customerId
) {

    const q = query(

        collection(
            db,
            COLLECTIONS.reviews
        ),

        where(
            'customerId',
            '==',
            customerId
        ),

        orderBy(
            'createdAt',
            'desc'
        )
    );

    const snap =
        await getDocs(q);

    return normalizeArray(
        snap
    );
}



export async function updateReview(

    id,

    data

) {

    return updateDoc(

        doc(
            db,
            COLLECTIONS.reviews,
            id
        ),

        {

            ...data,

            updatedAt:
                serverTimestamp()
        }
    );
}



export async function deleteReview(
    id
) {

    return deleteDoc(

        doc(
            db,
            COLLECTIONS.reviews,
            id
        )
    );
}
// ======================================================
// COIN HISTORY
// ======================================================

export async function getCoinHistory(
    customerId
) {

    const q = query(

        collection(
            db,
            COLLECTIONS
                .coinHistory
        ),

        where(
            'customerId',
            '==',
            customerId
        ),

        orderBy(
            'createdAt',
            'desc'
        )
    );

    const snap =
        await getDocs(q);

    return normalizeArray(
        snap
    );
}



export async function addCoinHistory(
    data
) {

    return addDoc(

        collection(
            db,
            COLLECTIONS
                .coinHistory
        ),

        {

            ...data,

            amount:
                Number(
                    data.amount
                ),

            createdAt:
                serverTimestamp()
        }
    );
}



export async function addCoins(

    customerId,

    amount,

    reason =
        'Purchase Reward'

) {

    const customer =
        await getCustomer(
            customerId
        );

    if (
        !customer
    ) {

        return;
    }

    const current =
        Number(
            customer
                .superCoins || 0
        );

    await updateDoc(

        doc(
            db,
            COLLECTIONS
                .customers,
            customerId
        ),

        {

            superCoins:
                current +
                Number(
                    amount
                )
        }
    );

    await addCoinHistory({

        customerId,

        amount,

        type:
            'earned',

        reason
    });
}



export async function spendCoins(

    customerId,

    amount,

    reason =
        'Redeemed'

) {

    const customer =
        await getCustomer(
            customerId
        );

    if (
        !customer
    ) {

        return false;
    }

    const current =
        Number(
            customer
                .superCoins || 0
        );

    if (
        current <
        amount
    ) {

        return false;
    }

    await updateDoc(

        doc(
            db,
            COLLECTIONS
                .customers,
            customerId
        ),

        {

            superCoins:
                current -
                amount
        }
    );

    await addCoinHistory({

        customerId,

        amount,

        type:
            'spent',

        reason
    });

    return true;
}
// ======================================================
// CUSTOMERS
// ======================================================

export async function getCustomers() {

    const snap =
        await getDocs(

            collection(
                db,
                COLLECTIONS
                    .customers
            )
        );

    return normalizeArray(
        snap
    );
}



export async function getCustomer(
    id
) {

    const snap =
        await getDoc(

            doc(
                db,
                COLLECTIONS
                    .customers,
                id
            )
        );

    if (
        !snap.exists()
    ) {

        return null;
    }

    return normalizeDoc(
        snap
    );
}



export async function getCustomerByPhone(
    phone
) {

    const q = query(

        collection(
            db,
            COLLECTIONS
                .customers
        ),

        where(
            'phone',
            '==',
            phone
        ),

        limit(1)
    );

    const snap =
        await getDocs(q);

    if (
        snap.empty
    ) {

        return null;
    }

    return normalizeDoc(
        snap.docs[0]
    );
}



export async function updateCustomer(

    id,

    data

) {

    return updateDoc(

        doc(
            db,
            COLLECTIONS
                .customers,
            id
        ),

        data
    );
}



// ======================================================
// DASHBOARD HELPERS
// ======================================================

export async function getDashboardStats() {

    const [

        shops,

        products,

        customers,

        reservations,

        reviews

    ] = await Promise.all([

        getShops(),

        getProducts(),

        getCustomers(),

        getReservations(),

        getReviews()
    ]);

    return {

        totalShops:
            shops.length,

        totalProducts:
            products.length,

        totalCustomers:
            customers.length,

        totalReservations:
            reservations.length,

        totalReviews:
            reviews.length,

        totalTopPartners:

            shops.filter(
                s =>
                    s.topPartner
            ).length,

        totalBusiness:

            shops.filter(
                s =>
                    s.plan ===
                    SHOP_PLANS
                        .BUSINESS
            ).length
    };
}
export async function getRewardRules() {

    const snap =
        await getDocs(

            collection(
                db,
                COLLECTIONS.rewardRules
            )
        );

    return normalizeArray(
        snap
    );
}



export async function createRewardRule(
    data
) {

    return addDoc(

        collection(
            db,
            COLLECTIONS.rewardRules
        ),

        {

            ...data,

            createdAt:
                serverTimestamp()

        }
    );
}



export async function updateRewardRule(

    id,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS.rewardRules,

            id

        ),

        data
    );
}



export async function deleteRewardRule(
    id
) {

    return deleteDoc(

        doc(

            db,

            COLLECTIONS.rewardRules,

            id

        )
    );
}



// ======================================================
// WEEKLY GIFTS
// ======================================================

export async function getWeeklyRewards() {

    const snap =
        await getDocs(

            collection(

                db,

                COLLECTIONS.weeklyRewards

            )
        );

    return normalizeArray(
        snap
    );
}



export async function createWeeklyReward(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS.weeklyRewards

        ),

        {

            ...data,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function updateWeeklyReward(

    id,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS.weeklyRewards,

            id

        ),

        data
    );
}



export async function deleteWeeklyReward(
    id
) {

    return deleteDoc(

        doc(

            db,

            COLLECTIONS.weeklyRewards,

            id

        )
    );
}



// ======================================================
// REWARD HISTORY
// ======================================================

export async function addRewardHistory(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS.rewardHistory

        ),

        {

            ...data,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function getRewardHistory(
    customerId
) {

    const q =
        query(

            collection(

                db,

                COLLECTIONS.rewardHistory

            ),

            where(

                'customerId',

                '==',

                customerId

            ),

            orderBy(

                'createdAt',

                'desc'

            )

        );

    const snap =
        await getDocs(q);

    return normalizeArray(
        snap
    );
}
// ======================================================
// SPIN LEVELS
// ======================================================

export async function getSpinLevels() {

    const snap =
        await getDocs(

            collection(

                db,

                COLLECTIONS
                    .spinLevels

            )

        );

    return normalizeArray(
        snap
    );
}



export async function createSpinLevel(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS
                .spinLevels

        ),

        {

            ...data,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function updateSpinLevel(

    id,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .spinLevels,

            id

        ),

        data

    );
}



export async function deleteSpinLevel(
    id
) {

    return deleteDoc(

        doc(

            db,

            COLLECTIONS
                .spinLevels,

            id

        )

    );
}



// ======================================================
// SCRATCH LEVELS
// ======================================================

export async function getScratchLevels() {

    const snap =
        await getDocs(

            collection(

                db,

                COLLECTIONS
                    .scratchLevels

            )

        );

    return normalizeArray(
        snap
    );
}



export async function createScratchLevel(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS
                .scratchLevels

        ),

        {

            ...data,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function updateScratchLevel(

    id,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .scratchLevels,

            id

        ),

        data

    );
}



export async function deleteScratchLevel(
    id
) {

    return deleteDoc(

        doc(

            db,

            COLLECTIONS
                .scratchLevels,

            id

        )

    );
}
// ======================================================
// MYSTERY REWARDS
// ======================================================

export async function getMysteryRewards() {

    const snap =
        await getDocs(

            collection(

                db,

                COLLECTIONS
                    .mysteryRewards

            )

        );

    return normalizeArray(
        snap
    );
}



export async function createMysteryReward(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS
                .mysteryRewards

        ),

        {

            ...data,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function updateMysteryReward(

    id,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .mysteryRewards,

            id

        ),

        data

    );
}



export async function deleteMysteryReward(
    id
) {

    return deleteDoc(

        doc(

            db,

            COLLECTIONS
                .mysteryRewards,

            id

        )

    );
}



// ======================================================
// PHYSICAL REWARDS
// ======================================================

export async function getPhysicalRewards() {

    const snap =
        await getDocs(

            collection(

                db,

                COLLECTIONS
                    .physicalRewards

            )

        );

    return normalizeArray(
        snap
    );
}



export async function createPhysicalReward(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS
                .physicalRewards

        ),

        {

            ...data,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function updatePhysicalReward(

    id,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .physicalRewards,

            id

        ),

        data

    );
}



export async function deletePhysicalReward(
    id
) {

    return deleteDoc(

        doc(

            db,

            COLLECTIONS
                .physicalRewards,

            id

        )

    );
}
// ======================================================
// REWARD COUPONS
// ======================================================

export async function createRewardCoupon(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS
                .rewardCoupons

        ),

        {

            ...data,

            status:
                data.status ||
                'ACTIVE',

            used:
                false,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function getCustomerCoupons(
    customerId
) {

    const q =
        query(

            collection(

                db,

                COLLECTIONS
                    .rewardCoupons

            ),

            where(

                'customerId',

                '==',

                customerId

            ),

            orderBy(

                'createdAt',

                'desc'

            )

        );

    const snap =
        await getDocs(q);

    return normalizeArray(
        snap
    );
}



export async function useRewardCoupon(
    id
) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .rewardCoupons,

            id

        ),

        {

            used:
                true,

            status:
                'USED',

            usedAt:
                serverTimestamp()

        }

    );
}



export async function expireRewardCoupon(
    id
) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .rewardCoupons,

            id

        ),

        {

            status:
                'EXPIRED',

            expiredAt:
                serverTimestamp()

        }

    );
}



// ======================================================
// CUSTOMER REWARD STATS
// ======================================================

export async function getCustomerRewardStats(
    customerId
) {

    const snap =
        await getDoc(

            doc(

                db,

                COLLECTIONS
                    .customerRewardStats,

                customerId

            )

        );

    if (
        !snap.exists()
    ) {

        return null;
    }

    return normalizeDoc(
        snap
    );
}



export async function updateCustomerRewardStats(

    customerId,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .customerRewardStats,

            customerId

        ),

        data

    );
}
// ======================================================
// VIP LEVELS
// ======================================================

export async function getVIPLevels() {

    const snap =
        await getDocs(

            collection(

                db,

                COLLECTIONS
                    .vipLevels

            )

        );

    return normalizeArray(
        snap
    );
}



export async function createVIPLevel(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS
                .vipLevels

        ),

        {

            ...data,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function updateVIPLevel(

    id,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .vipLevels,

            id

        ),

        data

    );
}



export async function deleteVIPLevel(
    id
) {

    return deleteDoc(

        doc(

            db,

            COLLECTIONS
                .vipLevels,

            id

        )

    );
}



// ======================================================
// CUSTOMER STREAK
// ======================================================

export async function getCustomerStreak(
    customerId
) {

    const snap =
        await getDoc(

            doc(

                db,

                COLLECTIONS
                    .streaks,

                customerId

            )

        );

    if (
        !snap.exists()
    ) {

        return null;
    }

    return normalizeDoc(
        snap
    );
}



export async function updateCustomerStreak(

    customerId,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .streaks,

            customerId

        ),

        data

    );
}
// ======================================================
// REWARD ANALYTICS
// ======================================================

export async function addRewardAnalytics(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS
                .rewardAnalytics

        ),

        {

            ...data,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function getRewardAnalytics() {

    const snap =
        await getDocs(

            collection(

                db,

                COLLECTIONS
                    .rewardAnalytics

            )

        );

    return normalizeArray(
        snap
    );
}



// ======================================================
// REWARD CLAIMS
// ======================================================

export async function createRewardClaim(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS
                .rewardClaims

        ),

        {

            ...data,

            status:
                'PENDING',

            createdAt:
                serverTimestamp()

        }

    );
}



export async function getRewardClaims() {

    const snap =
        await getDocs(

            collection(

                db,

                COLLECTIONS
                    .rewardClaims

            )

        );

    return normalizeArray(
        snap
    );
}



export async function updateRewardClaim(

    id,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .rewardClaims,

            id

        ),

        {

            ...data,

            updatedAt:
                serverTimestamp()

        }

    );
}



export async function deleteRewardClaim(
    id
) {

    return deleteDoc(

        doc(

            db,

            COLLECTIONS
                .rewardClaims,

            id

        )

    );
}
// ======================================================
// REWARD EXPIRY
// ======================================================

export async function getExpiredRewardCoupons() {

    const q =
        query(

            collection(

                db,

                COLLECTIONS
                    .rewardCoupons

            ),

            where(

                'status',

                '==',

                'EXPIRED'

            )

        );

    const snap =
        await getDocs(q);

    return normalizeArray(
        snap
    );
}



export async function expireReward(

    rewardId,

    collectionName

) {

    return updateDoc(

        doc(

            db,

            collectionName,

            rewardId

        ),

        {

            status:
                'EXPIRED',

            expiredAt:
                serverTimestamp()

        }

    );
}



// ======================================================
// REWARD USAGE HISTORY
// ======================================================

export async function getRewardUsageHistory(
    customerId
) {

    const q =
        query(

            collection(

                db,

                COLLECTIONS
                    .rewardHistory

            ),

            where(

                'customerId',

                '==',

                customerId

            ),

            orderBy(

                'createdAt',

                'desc'

            )

        );

    const snap =
        await getDocs(q);

    return normalizeArray(
        snap
    );
}



// ======================================================
// CUSTOMER ACTIVE REWARDS
// ======================================================

export async function getActiveCustomerRewards(
    customerId
) {

    const q =
        query(

            collection(

                db,

                COLLECTIONS
                    .rewardCoupons

            ),

            where(

                'customerId',

                '==',

                customerId

            ),

            where(

                'status',

                '==',

                'ACTIVE'

            )

        );

    const snap =
        await getDocs(q);

    return normalizeArray(
        snap
    );
}
// ======================================================
// CUSTOMER REWARD PROFILE
// ======================================================

export async function getCustomerRewardProfile(
    customerId
) {

    const snap =
        await getDoc(

            doc(

                db,

                COLLECTIONS
                    .customerRewardStats,

                customerId

            )

        );

    if (
        !snap.exists()
    ) {

        return null;
    }

    return normalizeDoc(
        snap
    );
}



export async function saveCustomerRewardProfile(

    customerId,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .customerRewardStats,

            customerId

        ),

        {

            ...data,

            updatedAt:
                serverTimestamp()

        }

    );
}



// ======================================================
// REWARD DASHBOARD
// ======================================================

export async function getRewardDashboard(
    customerId
) {

    const [

        history,

        coupons,

        stats

    ] = await Promise.all([

        getRewardHistory(
            customerId
        ),

        getCustomerCoupons(
            customerId
        ),

        getCustomerRewardStats(
            customerId
        )

    ]);

    return {

        history,

        coupons,

        stats

    };
}
// ======================================================
// REWARD INVENTORY
// ======================================================

export async function getRewardInventory() {

    const snap =
        await getDocs(

            collection(

                db,

                COLLECTIONS
                    .rewardInventory

            )

        );

    return normalizeArray(
        snap
    );
}



export async function createRewardInventoryItem(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS
                .rewardInventory

        ),

        {

            ...data,

            stock:
                Number(
                    data.stock
                ) || 0,

            active:
                true,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function updateRewardInventoryItem(

    id,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .rewardInventory,

            id

        ),

        {

            ...data,

            updatedAt:
                serverTimestamp()

        }

    );
}



export async function deleteRewardInventoryItem(
    id
) {

    return deleteDoc(

        doc(

            db,

            COLLECTIONS
                .rewardInventory,

            id

        )

    );
}



// ======================================================
// REWARD BANNERS
// ======================================================

export async function getRewardBanners() {

    const snap =
        await getDocs(

            collection(

                db,

                COLLECTIONS
                    .rewardBanners

            )

        );

    return normalizeArray(
        snap
    );
}



export async function createRewardBanner(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS
                .rewardBanners

        ),

        {

            ...data,

            active:
                true,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function updateRewardBanner(

    id,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .rewardBanners,

            id

        ),

        {

            ...data,

            updatedAt:
                serverTimestamp()

        }

    );
}



export async function deleteRewardBanner(
    id
) {

    return deleteDoc(

        doc(

            db,

            COLLECTIONS
                .rewardBanners,

            id

        )

    );
}

// ======================================================
// REWARD SETTINGS
// ======================================================

export async function getRewardSettings() {

    const snap =
        await getDocs(

            collection(

                db,

                COLLECTIONS
                    .rewardSettings

            )

        );

    return normalizeArray(
        snap
    );
}



export async function saveRewardSettings(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS
                .rewardSettings

        ),

        {

            ...data,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function updateRewardSettings(

    id,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .rewardSettings,

            id

        ),

        {

            ...data,

            updatedAt:
                serverTimestamp()

        }

    );
}



// ======================================================
// REWARD EVENTS
// ======================================================

export async function getRewardEvents() {

    const snap =
        await getDocs(

            collection(

                db,

                COLLECTIONS
                    .rewardEvents

            )

        );

    return normalizeArray(
        snap
    );
}



export async function createRewardEvent(
    data
) {

    return addDoc(

        collection(

            db,

            COLLECTIONS
                .rewardEvents

        ),

        {

            ...data,

            active:
                true,

            createdAt:
                serverTimestamp()

        }

    );
}



export async function updateRewardEvent(

    id,

    data

) {

    return updateDoc(

        doc(

            db,

            COLLECTIONS
                .rewardEvents,

            id

        ),

        {

            ...data,

            updatedAt:
                serverTimestamp()

        }

    );
}



export async function deleteRewardEvent(
    id
) {

    return deleteDoc(

        doc(

            db,

            COLLECTIONS
                .rewardEvents,

            id

        )

    );
}
// ======================================================
// EXPORTS
// ======================================================

export default {

    getShops,
    getShop,
    getShopBySlug,
    createShop,
    updateShop,
    deleteShop,

    getProducts,
    getProduct,
    getProductsByShop,
    createProduct,
    updateProduct,
    deleteProduct,

    getReservations,
    getReservation,
    getReservationsByCustomer,
    getReservationsByShop,
    createReservation,
    updateReservation,

    getReviews,
    getReviewsByShop,
    getReviewsByCustomer,
    createReview,
    updateReview,
    deleteReview,

    getCustomers,
    getCustomer,
    getCustomerByPhone,
    updateCustomer,

    getCoinHistory,
    addCoinHistory,
    addCoins,
    spendCoins,
    getDashboardStats,
    getRewardRules,
    createRewardRule,
    updateRewardRule,
    deleteRewardRule,

    getWeeklyRewards,
    createWeeklyReward,
    updateWeeklyReward,
    deleteWeeklyReward,

    addRewardHistory,
    getRewardHistory,
    getSpinLevels,
    createSpinLevel,
    updateSpinLevel,
    deleteSpinLevel,

    getScratchLevels,
    createScratchLevel,
    updateScratchLevel,
    deleteScratchLevel,
    getMysteryRewards,
    createMysteryReward,
    updateMysteryReward,
    deleteMysteryReward,

    getPhysicalRewards,
    createPhysicalReward,
    updatePhysicalReward,
    deletePhysicalReward,
    createRewardCoupon,
    getCustomerCoupons,
    useRewardCoupon,
    expireRewardCoupon,

    getCustomerRewardStats,
    updateCustomerRewardStats,
    getVIPLevels,
    createVIPLevel,
    updateVIPLevel,
    deleteVIPLevel,

    getCustomerStreak,
    updateCustomerStreak,
    addRewardAnalytics,
    getRewardAnalytics,

    createRewardClaim,
    getRewardClaims,
    updateRewardClaim,
    deleteRewardClaim,
    getExpiredRewardCoupons,
    expireReward,

    getRewardUsageHistory,

    getActiveCustomerRewards,
    getCustomerRewardProfile,
    saveCustomerRewardProfile,

    getRewardDashboard,
    getRewardInventory,
    createRewardInventoryItem,
    updateRewardInventoryItem,
    deleteRewardInventoryItem,

    getRewardBanners,
    createRewardBanner,
    updateRewardBanner,
    deleteRewardBanner,
    getRewardSettings,
    saveRewardSettings,
    updateRewardSettings,

    getRewardEvents,
    createRewardEvent,
    updateRewardEvent,
    deleteRewardEvent,
    getReservationByTicket,

    confirmReservationByTicket,

    cancelReservationByTicket



};
