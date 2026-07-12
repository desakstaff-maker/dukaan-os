// ======================================
// GENERATE ID
// ======================================

export function generateId(
  prefix = ''
) {

  const random =
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  return prefix
    ? `${prefix}-${random}`
    : random;
}



// ======================================
// GENERATE TICKET
// ======================================

export function generateTicketId() {

  const prefix =
    process.env
      .NEXT_PUBLIC_RESERVATION_PREFIX ||
    'DKS';

  const number =
    Math.floor(
      1000 +
      Math.random() *
      9000
    );

  return `${prefix}-${number}`;
}



// ======================================
// FORMAT PRICE
// ======================================

export function formatPrice(
  amount
) {

  return new Intl.NumberFormat(
    'en-IN',
    {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }
  ).format(
    Number(
      amount || 0
    )
  );
}



// ======================================
// FORMAT DATE
// ======================================

export function formatDate(
  date
) {

  if (!date)
    return '';

  const d =
    date?.toDate
      ? date.toDate()
      : new Date(
          date
        );

  return d.toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  );
}



// ======================================
// FORMAT DATETIME
// ======================================

export function formatDateTime(
  date
) {

  if (!date)
    return '';

  const d =
    date?.toDate
      ? date.toDate()
      : new Date(
          date
        );

  return d.toLocaleString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }
  );
}



// ======================================
// TIME AGO
// ======================================

export function timeAgo(
  date
) {

  if (!date)
    return '';

  const d =
    date?.toDate
      ? date.toDate()
      : new Date(
          date
        );

  const seconds =
    Math.floor(
      (
        Date.now() -
        d.getTime()
      ) / 1000
    );

  if (
    seconds < 60
  )
    return 'Just now';

  if (
    seconds < 3600
  )
    return `${Math.floor(
      seconds / 60
    )} min ago`;

  if (
    seconds < 86400
  )
    return `${Math.floor(
      seconds / 3600
    )} hr ago`;

  return `${Math.floor(
    seconds / 86400
  )} day ago`;
}



// ======================================
// PHONE FORMAT
// ======================================

export function formatPhone(
  phone
) {

  if (!phone)
    return '';

  const p =
    String(phone)
      .replace(/\D/g, '');

  if (
    p.length !== 10
  )
    return phone;

  return `${p.slice(
    0,
    5
  )} ${p.slice(
    5
  )}`;
}



// ======================================
// SLUG
// ======================================

export function slugify(
  text
) {

  return String(
    text || ''
  )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-|-$/g,
      ''
    );
}



// ======================================
// RANDOM COLOR
// ======================================

export function randomBannerColor() {

  const colors = [

    '#2563eb',
    '#16a34a',
    '#9333ea',
    '#dc2626',
    '#ea580c',
    '#0891b2',
    '#ca8a04',
    '#db2777'
  ];

  return colors[
    Math.floor(
      Math.random() *
      colors.length
    )
  ];
}



// ======================================
// EXPIRY CHECK
// ======================================

export function isExpired(
  date,
  hours = 24
) {

  if (!date)
    return false;

  const d =
    date?.toDate
      ? date.toDate()
      : new Date(
          date
        );

  return (
    Date.now() -
    d.getTime()
  ) >
    hours *
    60 *
    60 *
    1000;
}