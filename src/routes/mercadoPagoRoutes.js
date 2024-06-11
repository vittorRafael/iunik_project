const express = require('express');
const router = express();
const { MercadoPagoConfig, Preference } = require('mercadopago');
require('dotenv').config();

const client = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN || '',
});

router.post('/mercadopago', async (req, res) => {
  try {
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: 'item-ID-1234',
            title: 'Meu produto',
            currency_id: 'BRL',
            picture_url:
              'https://www.mercadopago.com/org-img/MP3/home/logomp3.gif',
            description: 'Descrição do Item',
            category_id: 'art',
            quantity: 1,
            unit_price: 75.76,
          },
        ],
        back_urls: {
          success: 'http://localhost:3000/mercadopagosuccess',
          failure: 'http://localhost:3000/mercadopagofailure',
        },
        auto_return: 'approved',
        statement_descriptor: 'Teste',
        external_reference: 'Reference_1234',
        expires: true,
        expiration_date_from: '2016-02-01T12:00:00.000-04:00',
        expiration_date_to: '2024-07-28T12:00:00.000-04:00',
      },
    });

    return res.json(response.init_point);
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error.message);
  }
});

router.get('/mercadopagosuccess', async (req, res) => {
  res.json({ success: 'deu certo' });
});

router.get('/mercadopagofailure', async (req, res) => {
  res.json({ error: 'deu errado' });
});

module.exports = router;
