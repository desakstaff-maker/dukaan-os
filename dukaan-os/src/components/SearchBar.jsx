'use client';

import {
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';

import {
  useState
} from 'react';



export default function SearchBar({

  value,

  onChange,

  filters = {},

  onFiltersChange

}) {

  const [

    open,

    setOpen

  ] = useState(
    false
  );



  function update(
    key,
    value
  ) {

    onFiltersChange?.({

      ...filters,

      [key]:
        value
    });
  }



  return (

    <>

      <div

        className="
          card
        "

        style={{

          padding:
            10,

          display:
            'flex',

          alignItems:
            'center',

          gap:
            10,

          position:
            'sticky',
        border:
            '1px solid #635f5f90',

          top:
            10,

          zIndex:
            50
        }}
      >

        <Search
          size={20}
        />



        <input

          value={
            value
          }

          onChange={
            e =>
              onChange(
                e.target
                  .value
              )
          }

          placeholder="
Search shops or products..."

          style={{

            flex: 1,

            border:
              'none',

            outline:
              'none',

            background:
              'transparent',

            fontSize:
              16
          }}
        />



        <button

          onClick={() =>
            setOpen(
              true
            )
          }
        >

          <SlidersHorizontal
            size={20}
          />

        </button>

      </div>



      {

        open && (

          <div

            style={{

              position:
                'fixed',

              inset: 0,

              background:
                'rgba(0,0,0,.5)',

              zIndex:
                1000
            }}
          >

            <div

              style={{

                position:
                  'absolute',

                bottom: 0,

                left: 0,

                right: 0,

                background:
                  '#fff',

                borderTopLeftRadius:
                  20,

                borderTopRightRadius:
                  20,

                padding:
                  20
              }}
            >

              <div

                className="
                  flex-between
                  mb-2
                "
              >

                <h3>
                  Filters
                </h3>

                <button
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                >

                  <X
                    size={22}
                  />

                </button>

              </div>



              <label>

                Category

              </label>

              <select

                className="
                  input
                  mb-2
                "

                value={
                  filters
                    .category ||
                  ''
                }

                onChange={
                  e =>
                    update(
                      'category',
                      e.target
                        .value
                    )
                }
              >

                <option value="">
                  All
                </option>

                <option value="agriculture">
                  Agriculture
                </option>

                <option value="kirana">
                  Kirana
                </option>

                <option value="electronics">
                  Electronics
                </option>

                <option value="clothing">
                  Clothing
                </option>

              </select>



              <label>

                Plan

              </label>

              <select

                className="
                  input
                  mb-2
                "

                value={
                  filters
                    .plan ||
                  ''
                }

                onChange={
                  e =>
                    update(
                      'plan',
                      e.target
                        .value
                    )
                }
              >

                <option value="">
                  All
                </option>

                <option value="FREE">
                  Free
                </option>

                <option value="PRO">
                  Pro
                </option>

                <option value="BUSINESS">
                  Business
                </option>

              </select>



              <label>

                Stock

              </label>

              <select

                className="
                  input
                  mb-3
                "

                value={
                  filters
                    .stock ||
                  ''
                }

                onChange={
                  e =>
                    update(
                      'stock',
                      e.target
                        .value
                    )
                }
              >

                <option value="">
                  All
                </option>

                <option value="available">
                  Available
                </option>

                <option value="out">
                  Out of Stock
                </option>

              </select>



              <button

                className="
                  btn
                  btn-primary
                "

                style={{
                  width:
                    '100%'
                }}

                onClick={() =>
                  setOpen(
                    false
                  )
                }
              >

                Apply Filters

              </button>

            </div>

          </div>

        )
      }

    </>
  );
}