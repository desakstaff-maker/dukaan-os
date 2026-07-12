'use client';

import Link from 'next/link';

export default function NotFound() {

  return (

    <div
      style={{
        minHeight:
          '100vh',

        display:
          'flex',

        flexDirection:
          'column',

        justifyContent:
          'center',

        alignItems:
          'center',

        padding:
          20,

        textAlign:
          'center'
      }}
    >

      <div
        style={{
          fontSize:
            80
        }}
      >

        😕
      </div>



      <h1
        style={{
          fontSize:
            36,

          fontWeight:
            900,

          marginTop:
            20
        }}
      >

        404

      </h1>



      <p
        style={{
          marginTop:
            10,

          color:
            '#64748b'
        }}
      >

        Page not found

      </p>



      <Link
        href="/"
        style={{
          marginTop:
            25,

          background:
            '#6d28d9',

          color:
            '#fff',

          padding:
            '12px 24px',

          borderRadius:
            10,

          fontWeight:
            900
        }}
      >

        Go Home

      </Link>

    </div>
  );
}