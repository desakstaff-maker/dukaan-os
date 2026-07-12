import {
  SHOP_PLANS
} from '@/lib/firebase';

const plans = {

  [SHOP_PLANS.FREE]: {

    id:
      SHOP_PLANS.FREE,

    name:
      'Free',

    price:
      0,

    monthlyPrice:
      0,

    badge:
      '',

    topPartner:
      false,

    priority:
      1,

    customerMultiplier:
      1,

    marketing:
      false,

    manualPromotion:
      false,

    websiteCustomization:
      false,

    analytics:
      false,

    salesTips:
      false,

    features: [

      'Shop listing',

      'Inventory link',

      'Customer reservations',

      'Reviews',

      'Map visibility',

      'Search visibility'
    ]
  },



  [SHOP_PLANS.PRO]: {

    id:
      SHOP_PLANS.PRO,

    name:
      'Pro',

    price:
      199,

    monthlyPrice:
      199,

    badge:
      'PRO',

    topPartner:
      false,

    priority:
      2,

    customerMultiplier:
      1.2,

    marketing:
      true,

    manualPromotion:
      false,

    websiteCustomization:
      false,

    analytics:
      true,

    salesTips:
      true,

    features: [

      'Everything in Free',

      'Better search ranking',

      'Extra customer SuperCoins',

      'Basic marketing support',

      'Sales improvement tips',

      'Analytics'
    ]
  },



  [SHOP_PLANS.BUSINESS]: {

    id:
      SHOP_PLANS.BUSINESS,

    name:
      'Business',

    price:
      499,

    monthlyPrice:
      499,

    badge:
      'TOP PARTNER',

    topPartner:
      true,

    priority:
      3,

    customerMultiplier:
      1.5,

    marketing:
      true,

    manualPromotion:
      true,

    websiteCustomization:
      true,

    analytics:
      true,

    salesTips:
      true,

    features: [

      'Everything in Pro',

      'Top Partner badge',

      'Homepage promotion',

      'Highest visibility',

      'Manual website customization',

      'Premium marketing support',

      'Maximum SuperCoins',

      'Priority support'
    ]
  }
};



export function getPlan(
  plan
) {

  return (

    plans[plan] ||

    plans[
      SHOP_PLANS
        .FREE
    ]
  );
}



export function getPriority(
  plan
) {

  return getPlan(
    plan
  ).priority;
}



export function getCustomerMultiplier(
  plan
) {

  return getPlan(
    plan
  )
    .customerMultiplier;
}



export default plans;