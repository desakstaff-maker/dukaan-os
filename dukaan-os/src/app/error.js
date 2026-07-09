'use client';

import { useEffect } from 'react';

export default function Error({

  error,

  reset

}) {

  useEffect(() => {

    console.error(
      error
    );

  }, [
    error
  ]);



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

        ⚠️

      </div>



      <h1
        style={{
          fontSize:
            28,

          fontWeight:
            900,

          marginTop:
            20
        }}
      >

        Something went wrong

      </h1>



      <p
        style={{
          color:
            '#64748b',

          marginTop:
            10,

          maxWidth:
            400
        }}
      >

        {
          error?.message ||
          'Unexpected error occurred'
        }

      </p>



      <button
        onClick={
          reset
        }
        style={{
          marginTop:
            25,

          background:
            '#6d28d9',

          color:
            '#fff',

          border:
            'none',

          padding:
            '12px 24px',

          borderRadius:
            10,

          fontWeight:
            900,

          cursor:
            'pointer'
        }}
      >

        Try Again

      </button>

    </div>
  );
}