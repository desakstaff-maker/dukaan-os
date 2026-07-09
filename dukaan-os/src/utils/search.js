// ======================================
// NORMALIZE
// ======================================

export function normalize(
  text
) {

  return String(
    text || ''
  )
    .toLowerCase()
    .trim();
}



// ======================================
// PRODUCT SCORE
// ======================================

export function getProductScore(
  query,
  product,
  shop
) {

  query =
    normalize(
      query
    );

  const productName =
    normalize(
      product.name
    );

  const shopName =
    normalize(
      shop?.name
    );

  let score = 0;



  // Exact product

  if (
    productName ===
    query
  )
    score += 1000;



  // Starts with

  if (
    productName.startsWith(
      query
    )
  )
    score += 500;



  // Includes

  if (
    productName.includes(
      query
    )
  )
    score += 300;



  // Shop match

  if (
    shopName.includes(
      query
    )
  )
    score += 100;



  // Availability

  if (
    product.stock > 0
  )
    score += 50;



  // Recently updated

  if (
    product.updatedAt
  )
    score += 20;



  // Monthly buyers

  score +=
    Math.min(
      shop?.monthlyBuyers || 0,
      500
    );



  return score;
}



// ======================================
// SHOP SCORE
// ======================================

export function getShopScore(
  query,
  shop
) {

  query =
    normalize(
      query
    );

  const shopName =
    normalize(
      shop.name
    );

  let score = 0;



  if (
    shopName ===
    query
  )
    score += 1000;



  if (
    shopName.startsWith(
      query
    )
  )
    score += 500;



  if (
    shopName.includes(
      query
    )
  )
    score += 300;



  if (
    shop.topPartner
  )
    score += 50;



  score +=
    Math.min(
      shop.monthlyBuyers || 0,
      500
    );



  return score;
}



// ======================================
// SEARCH PRODUCTS
// ======================================

export function searchProducts(
  query,
  products,
  shops
) {

  if (!query)
    return [];

  return products

    .map(
      product => {

        const shop =
          shops.find(
            s =>
              s.id ===
              product.shopId
          );

        return {

          ...product,

          shop,

          score:
            getProductScore(
              query,
              product,
              shop
            )
        };
      }
    )

    .filter(
      p =>
        p.score > 0
    )

    .sort(
      (a, b) =>
        b.score -
        a.score
    );
}



// ======================================
// SEARCH SHOPS
// ======================================

export function searchShops(
  query,
  shops
) {

  if (!query)
    return [];

  return shops

    .map(
      shop => ({

        ...shop,

        score:
          getShopScore(
            query,
            shop
          )
      })
    )

    .filter(
      shop =>
        shop.score > 0
    )

    .sort(
      (a, b) =>
        b.score -
        a.score
    );
}



// ======================================
// DETECT SEARCH TYPE
// ======================================

export function detectSearchType(
  query,
  products,
  shops
) {

  const productResults =
    searchProducts(
      query,
      products,
      shops
    );

  const shopResults =
    searchShops(
      query,
      shops
    );

  const bestProduct =
    productResults[0]
      ?.score || 0;

  const bestShop =
    shopResults[0]
      ?.score || 0;

  return bestShop >
    bestProduct
    ? 'shop'
    : 'product';
}