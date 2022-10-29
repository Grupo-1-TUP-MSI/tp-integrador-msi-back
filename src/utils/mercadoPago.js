const mercadoPago = require('mercadopago');
require('dotenv').config();

mercadoPago.configure({
    access_token: process.env.MP_ACCESS_TOKEN,
});

module.exports = { 
    mercadoPago
};
