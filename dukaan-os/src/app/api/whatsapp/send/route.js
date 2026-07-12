import { NextResponse } from 'next/server';

import {

  sendReservationMessage

} from '@/lib/whatsapp';



export async function POST(request) {

  try {

    const {

      shopWhatsappNumber,

      reservation

    } = await request.json();



    await sendReservationMessage({

      shopWhatsappNumber,

      reservation

    });



    return NextResponse.json({

      success: true

    });

  } catch (error) {

    console.error(

      error

    );



    return NextResponse.json(

      {

        success: false,

        error:

          error.message

      },

      {

        status: 500

      }

    );

  }

}