'use client';

import {
  Star,
  Trash2,
  Pencil
} from 'lucide-react';

import {
  formatDate
} from '@/utils/helpers';



export default function ReviewCard({

  review,

  currentUser,

  isAdmin = false,

  onEdit,

  onDelete

}) {

  const canEdit =
    currentUser?.id ===
      review.customerId ||
    isAdmin;



  return (

    <div
      className="
        card
      "
      style={{
        padding: 14
      }}
    >

      <div
        className="
          flex-between
          mb-1
        "
      >

        <div>

          <div
            style={{
              fontWeight:
                900
            }}
          >

            {
              review.customerName
            }

          </div>

          <div
            className="
              text-small
              text-muted
            "
          >

            {
              formatDate(
                review.createdAt
              )
            }

          </div>

        </div>



        <div
          className="
            flex
            gap-1
          "
          style={{
            alignItems:
              'center',

            color:
              '#f59e0b',

            fontWeight:
              900
          }}
        >

          <Star
            size={16}
            fill="
currentColor"
          />

          {
            review.rating
          }

        </div>

      </div>



      <div
        style={{
          marginTop: 10,
          marginBottom: 10,
          lineHeight: 1.5
        }}
      >

        {
          review.review
        }

      </div>



      {
        canEdit && (

          <div
            className="
              flex
              gap-1
            "
          >

            <button
              className="
                btn
              "
              onClick={() =>
                onEdit?.(
                  review
                )
              }
            >

              <Pencil
                size={16}
              />

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
                onDelete?.(
                  review
                )
              }
            >

              <Trash2
                size={16}
              />

            </button>

          </div>

        )
      }

    </div>
  );
}