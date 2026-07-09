'use client';

import {
  useEffect,
  useState
} from 'react';

import {
  useParams
} from 'next/navigation';

import Header from '@/components/Header';
import Loading from '@/components/Loading';

import {

  getShops,
  getProductsByShop,

  createProduct,
  updateProduct,
  deleteProduct

} from '@/lib/db';



export default function UpdatePage() {

  const {
    token
  } = useParams();



  const [

    loading,

    setLoading

  ] = useState(
    true
  );



  const [

    shop,

    setShop

  ] = useState(
    null
  );



  const [

    products,

    setProducts

  ] = useState(
    []
  );



  const [

    newProduct,

    setNewProduct

  ] = useState({

    name: '',

    price: '',

    stock: '',

    image: '',

    category:
      'others'
  });



  useEffect(() => {

    initialize();

  }, [
    token
  ]);



  async function initialize() {

    try {

      const shops =
        await getShops();

      const current =
        shops.find(
          s =>
            s.updateToken ===
            token
        );

      if (
        !current
      ) {

        setLoading(
          false
        );

        return;
      }

      setShop(
        current
      );

      const inventory =

        await getProductsByShop(
          current.id
        );

      setProducts(
        inventory
      );

    } finally {

      setLoading(
        false
      );
    }
  }
  async function add() {

    if (
      !newProduct.name
    ) {

      return;
    }

    await createProduct({

      ...newProduct,

      shopId:
        shop.id,

      shopName:
        shop.name,

      price:
        Number(
          newProduct.price
        ),

      stock:
        Number(
          newProduct.stock
        )
    });

    const inventory =

      await getProductsByShop(
        shop.id
      );

    setProducts(
      inventory
    );

    setNewProduct({

      name: '',

      price: '',

      stock: '',

      image: '',

      category:
        'others'
    });
  }



  async function save(
    product
  ) {

    await updateProduct(

      product.id,

      {

        name:
          product.name,

        price:
          Number(
            product.price
          ),

        stock:
          Number(
            product.stock
          ),

        image:
          product.image,

        category:
          product.category
      }
    );

    alert(
      'Saved'
    );
  }



  async function remove(
    id
  ) {

    if (
      !confirm(
        'Delete product?'
      )
    ) {

      return;
    }

    await deleteProduct(
      id
    );

    setProducts(

      products.filter(
        p =>
          p.id !==
          id
      )
    );
  }



  if (
    loading
  ) {

    return (
      <Loading />
    );
  }



  if (
    !shop
  ) {

    return (

      <div className="
        page
      ">

        <Header
          showCoins={
            false
          }
        />

        <div

          className="
            container
            text-center
          "

          style={{
            paddingTop:
              100
          }}
        >

          <h2>

            Invalid
            Link

          </h2>

        </div>

      </div>
    );
  }
  return (

    <div className="
      page
    ">

      <Header
        showCoins={
          false
        }
      />



      <div className="
        container
      ">

        <h1
          className="
            mb-3
          "
        >

          {
            shop.name
          }

          {' '}
          Inventory

        </h1>



        <div

          className="
            card
            mb-3
          "

          style={{
            padding:
              16
          }}
        >

          <h3
            className="
              mb-2
            "
          >

            Add Product

          </h3>



          <input

            className="
              input
              mb-2
            "

            placeholder="
Product Name"

            value={
              newProduct.name
            }

            onChange={
              e =>
                setNewProduct({

                  ...newProduct,

                  name:
                    e.target
                      .value
                })
            }
          />



          <input

            type="number"

            className="
              input
              mb-2
            "

            placeholder="
Price"

            value={
              newProduct.price
            }

            onChange={
              e =>
                setNewProduct({

                  ...newProduct,

                  price:
                    e.target
                      .value
                })
            }
          />



          <input

            type="number"

            className="
              input
              mb-2
            "

            placeholder="
Stock"

            value={
              newProduct.stock
            }

            onChange={
              e =>
                setNewProduct({

                  ...newProduct,

                  stock:
                    e.target
                      .value
                })
            }
          />



          <input

            className="
              input
              mb-2
            "

            placeholder="
Image URL"

            value={
              newProduct.image
            }

            onChange={
              e =>
                setNewProduct({

                  ...newProduct,

                  image:
                    e.target
                      .value
                })
            }
          />
          <select

            className="
              input
              mb-2
            "

            value={
              newProduct.category
            }

            onChange={
              e =>
                setNewProduct({

                  ...newProduct,

                  category:
                    e.target
                      .value
                })
            }
          >

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

            <option value="others">
              Others
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

            onClick={
              add
            }
          >

            Add Product

          </button>

        </div>



        {
          products.map(
            product => (

              <div

                key={
                  product.id
                }

                className="
                  card
                  mb-2
                "

                style={{
                  padding:
                    16
                }}
              >

                <input
                  className="
                    input
                    mb-2
                  "
                  value={
                    product.name
                  }
                  onChange={
                    e =>
                      setProducts(
                        products.map(
                          p =>
                            p.id ===
                              product.id
                              ? {
                                ...p,
                                name:
                                  e.target
                                    .value
                              }
                              : p
                        )
                      )
                  }
                />



                <input
                  type="number"
                  className="
                    input
                    mb-2
                  "
                  value={
                    product.price
                  }
                  onChange={
                    e =>
                      setProducts(
                        products.map(
                          p =>
                            p.id ===
                              product.id
                              ? {
                                ...p,
                                price:
                                  e.target
                                    .value
                              }
                              : p
                        )
                      )
                  }
                />



                <input
                  type="number"
                  className="
                    input
                    mb-2
                  "
                  value={
                    product.stock
                  }
                  onChange={
                    e =>
                      setProducts(
                        products.map(
                          p =>
                            p.id ===
                              product.id
                              ? {
                                ...p,
                                stock:
                                  e.target
                                    .value
                              }
                              : p
                        )
                      )
                  }
                />



                <div
                  className="
                    flex
                    gap-1
                  "
                >

                  <button

                    className="
                      btn
                      btn-primary
                    "

                    style={{
                      flex: 1
                    }}

                    onClick={() =>
                      save(
                        product
                      )
                    }
                  >

                    Save

                  </button>



                  <button

                    className="
                      btn
                    "

                    style={{
                      background:
                        '#fee2e2'
                    }}

                    onClick={() =>
                      remove(
                        product.id
                      )
                    }
                  >

                    Delete

                  </button>

                </div>

              </div>

            )
          )
        }

      </div>

    </div>
  );
}