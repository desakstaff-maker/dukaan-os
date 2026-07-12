import { NextResponse } from 'next/server';

import {

    WHATSAPP

} from '@/config/whatsapp';
import {

    sendConfirmedMessage,

    sendCancelledMessage,

    sendAlreadyProcessed,

    sendInvalidReply

} from '@/lib/whatsapp';
import {

    confirmReservationByTicket,

    cancelReservationByTicket

} from '@/lib/db';

import {

    sendReservationMessage

} from '@/lib/whatsapp';



export async function GET(request) {

    const { searchParams } =

        new URL(request.url);



    const mode =

        searchParams.get(

            'hub.mode'

        );



    const token =

        searchParams.get(

            'hub.verify_token'

        );



    const challenge =

        searchParams.get(

            'hub.challenge'

        );



    if (

        mode === 'subscribe' &&

        token ===

        WHATSAPP.VERIFY_TOKEN

    ) {

        return new Response(

            challenge,

            {

                status: 200

            }

        );

    }



    return new Response(

        'Forbidden',

        {

            status: 403

        }

    );

}



export async function POST(request) {

    try {

        const body =

            await request.json();



        const value =

            body?.entry?.[0]

                ?.changes?.[0]

                ?.value;



        const message =

            value?.messages?.[0];



        if (!message)

            return NextResponse.json({

                success: true

            });



        const from =

            message.from;



        const text =

            message.text?.body

                ?.trim()

                ?.toUpperCase();



        if (!text)

            return NextResponse.json({

                success: true

            });



        const [action, ticket] =

            text.split(/\s+/);



        if (

            !action ||

            !ticket

        ) {

            await sendInvalidReply(

                from

            );



            return NextResponse.json({

                success: true

            });

        }



        if (

            action === 'YES'

        ) {

            const result =

                await confirmReservationByTicket(

                    ticket

                );



            if (

                result ===

                'ALREADY_CONFIRMED'

            ) {

                await sendAlreadyProcessed(

                    from,

                    'confirmed'

                );

            }

            else if (

                result ===

                'ALREADY_CANCELLED'

            ) {

                await sendAlreadyProcessed(

                    from,

                    'cancelled'

                );

            }

            else if (

                result

            ) {

                await sendConfirmedMessage(

                    from,

                    ticket

                );

            }

        }

        else if (

            action === 'NO'

        ) {

            const result =

                await cancelReservationByTicket(

                    ticket

                );



            if (

                result ===

                'ALREADY_CANCELLED'

            ) {

                await sendAlreadyProcessed(

                    from,

                    'cancelled'

                );

            }

            else if (

                result ===

                'ALREADY_CONFIRMED'

            ) {

                await sendAlreadyProcessed(

                    from,

                    'confirmed'

                );

            }

            else if (

                result

            ) {

                await sendCancelledMessage(

                    from,

                    ticket

                );

            }

        }

        else {

            await sendInvalidReply(

                from

            );

        }



        return NextResponse.json({

            success: true

        });

    }

    catch (error) {

        console.error(

            error

        );



        return NextResponse.json(

            {

                success: false

            },

            {

                status: 500

            }

        );

    }

}