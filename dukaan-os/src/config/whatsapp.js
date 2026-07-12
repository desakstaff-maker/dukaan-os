export const WHATSAPP = {

    API_VERSION:

        process.env.NEXT_PUBLIC_GRAPH_API_VERSION ||

        'v23.0',



    ACCESS_TOKEN:

        process.env.NEXT_PUBLIC_WHATSAPP_TOKEN ||

        'DUMMY_ACCESS_TOKEN',



    PHONE_NUMBER_ID:

        process.env.NEXT_PUBLIC_PHONE_NUMBER_ID ||

        'DUMMY_PHONE_NUMBER_ID',



    VERIFY_TOKEN:

        process.env.NEXT_PUBLIC_VERIFY_TOKEN ||

        'DUKAAN_OS_VERIFY_TOKEN'

};



export function graphApi(path = '') {

    return `https://graph.facebook.com/${WHATSAPP.API_VERSION}/${path}`;

}



export function shopWhatsappNumber(shop) {

    return (

        shop.whatsappNumber ||

        shop.phone ||

        ''

    );

}



export function reservationTicket(id) {

    return `DK-${String(id).slice(-6).toUpperCase()}`;

}
