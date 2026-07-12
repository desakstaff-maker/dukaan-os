import {

    graphApi,

    WHATSAPP

} from '@/config/whatsapp';



async function sendText(

    to,

    body

) {

    if (

        !to ||

        WHATSAPP.ACCESS_TOKEN ===

        'DUMMY_ACCESS_TOKEN'

    ) {

        return;

    }



    const response =

        await fetch(

            graphApi(

                `${WHATSAPP.PHONE_NUMBER_ID}/messages`

            ),

            {

                method: 'POST',

                headers: {

                    Authorization:

                        `Bearer ${WHATSAPP.ACCESS_TOKEN}`,

                    'Content-Type':

                        'application/json'

                },

                body: JSON.stringify({

                    messaging_product:

                        'whatsapp',

                    to,

                    type:

                        'text',

                    text: {

                        preview_url:

                            false,

                        body

                    }

                })

            }

        );



    return response.json();

}



export async function sendReservationMessage({

    shopWhatsappNumber,

    reservation

}) {

    return sendText(

        shopWhatsappNumber,

        `🛒 *NEW RESERVATION*

🎟 Ticket
${reservation.ticketId}

👤 Customer
${reservation.customerName}

📞 Mobile
${reservation.customerPhone}

📦 Product
${reservation.productName}

🔢 Quantity
${reservation.quantity}

💵 Original Price
₹${reservation.originalPrice}

💰 Cash To Collect
₹${reservation.cashAmount}

🪙 SuperCoins Used
${reservation.coinsUsed}

📅 Visit
${reservation.visitDate}

🕒 Time
${reservation.visitTime}

Reply exactly:

YES ${reservation.ticketId}

or

NO ${reservation.ticketId}`

    );

}



export async function sendConfirmedMessage(

    phone,

    ticket

) {

    return sendText(

        phone,

        `✅ Reservation Confirmed

Ticket

${ticket}

Customer may collect the order.`

    );

}



export async function sendCancelledMessage(

    phone,

    ticket

) {

    return sendText(

        phone,

        `❌ Reservation Cancelled

Ticket

${ticket}`

    );

}



export async function sendInvalidReply(

    phone

) {

    return sendText(

        phone,

        `Invalid reply.

Reply only:

YES DK-XXXXXX

or

NO DK-XXXXXX`

    );

}



export async function sendAlreadyProcessed(

    phone,

    status

) {

    return sendText(

        phone,

        `Reservation already ${status}.`

    );

}