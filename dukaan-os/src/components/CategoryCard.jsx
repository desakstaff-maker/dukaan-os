'use client';

import Image from 'next/image';



export default function CategoryCard({

  category,

  active = false,

  onClick

}) {

  return (

    <button
      onClick={() =>
        onClick?.(
          category
        )
      }
      className="
        card
      "
      style={{

        padding: 14,

        display: 'flex',

        flexDirection:
          'column',

        alignItems:
          'center',

        gap: 10,

        background:
          active
            ? category.color
            : '#fff',

        color:
          active
            ? '#fff'
            : '#000',

        width: '100%'
      }}
    >

      <div
        style={{
          width: 48,
          height: 48,
          position:
            'relative'
        }}
      >

        <Image
          src={
            category.icon
          }
          alt={
            category.name
          }
          fill
          style={{
            objectFit:
              'contain'
          }}
        />

      </div>



      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          textAlign:
            'center'
        }}
      >

        {
          category.name
        }

      </div>

    </button>
  );
}