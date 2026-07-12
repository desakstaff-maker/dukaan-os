import {
  SUPERCOINS
} from '@/lib/firebase';

import plans from '@/data/plans';



export function calculateCoins(

  amount,

  plan = 'FREE'

) {

  const multiplier =

    plans[
      plan
    ]?.customerMultiplier ||

    1;

  return Math.floor(

    amount *

    (
      SUPERCOINS
        .DEFAULT_PERCENT /
      100
    ) *

    multiplier
  );
}



export function coinsToRupees(
  coins
) {

  return Number(
    (
      coins /

      SUPERCOINS
        .COINS_PER_RUPEE
    ).toFixed(2)
  );
}



export function rupeesToCoins(
  rupees
) {

  return Math.floor(

    rupees *

    SUPERCOINS
      .COINS_PER_RUPEE
  );
}



export function formatCoins(
  coins
) {

  return `${

    Number(
      coins || 0
    ).toLocaleString()

  } SC`;
}



export function canRedeem(
  coins,
  required
) {

  return (
    Number(coins) >=
    Number(required)
  );
}



export function getRewardText(

  amount,

  plan

) {

  const coins =
    calculateCoins(
      amount,
      plan
    );

  return `Earn ${coins} SuperCoins`;
}



export default {

  calculateCoins,

  coinsToRupees,

  rupeesToCoins,

  formatCoins,

  canRedeem,

  getRewardText
};