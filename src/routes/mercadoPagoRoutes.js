const express = require('express');
const router = express();
const { MercadoPagoConfig, Preference } = require('mercadopago');
const knex = require('../config/connect');
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

    return res.json(response);
  } catch (error) {
    res.status(500).json(error.message);
  }
});


router.post('/webhook', async (req, res) => {
  try {
    const { data, type } = req.body;
    if (type === 'payment') {
      // Consulta o pagamento pelo ID recebido
      const paymentInfo = await consultarPagamento(data.id);
      console.log(paymentInfo);
      // Aqui você pode salvar os dados no banco ou realizar outras ações
    } else {
      console.log(`Evento ignorado: ${type}`);
      return res.json({ error: `Evento ignorado: ${type}`});
    }

    return res.status(200).send() // Retorne 200 para confirmar o recebimento
  } catch (error) {
    console.error('Erro no webhook:', error.message);
    return res.status(500).send('Erro ao processar o webhook');
  }
});

// Função para consultar o pagamento pelo ID
async function consultarPagamento(paymentId) {
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN; // Substitua pelo seu token de acesso
  const url = `https://api.mercadopago.com/v1/payments/${paymentId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });

  const data = await response.json()
  console.log(data.external_reference);

  if (data.status === 'approved') {
    await knex('pedidos').where('id', data.external_reference).update({ statuspag: 'realizado' })
    if(data.payment_method_id === 'pix' || data.payment_type_id === 'account_money') {
      await knex('pedidos').where('id', data.external_reference).update({ formapag_id: 1 })
    } else if(data.payment_type_id === 'credit_card') {
      await knex('pedidos').where('id', data.external_reference).update({ formapag_id: 2 })
    } else if(data.payment_type_id === 'debit_card') {
      await knex('pedidos').where('id', data.external_reference).update({ formapag_id: 3 })
    } else if(data.payment_type_id === 'ticket') {
      await knex('pedidos').where('id', data.external_reference).update({ formapag_id: 4 })
    }
  } else if (data.status === 'pending') {
    await knex('pedidos').where('id', data.external_reference).update({ statuspag: 'aguardando' })
  } else {
    await knex('pedidos').where('id', data.external_reference).update({ statuspag: 'recusado' })
  }
  return await response.json();
}

router.post('/calcularfrete', async (req, res) => {
  const { zipCodeAdress, productsData } = req.body;

  // Validação inicial
  if (!zipCodeAdress || !productsData) {
    return res.status(400).json({ error: "Campos 'zipCodeAdress' e 'productsData' são obrigatórios!" });
  }

  const url =
    "https://melhorenvio.com.br/api/v2/me/shipment/calculate"
  const token =
   "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOWM5YWRlZGY5ODZlZWQ2ZjA3ZTUyZTE3YTk2N2Q1MmM3ZDY2MTcwZDI3NzQ1NGVkZDdkYTNmZDgxNDZkYWQzZmNmNjUwNzRlNDUzNWNlN2QiLCJpYXQiOjE3MjE3NzMzMDguNDU0MTc4LCJuYmYiOjE3MjE3NzMzMDguNDU0MTgsImV4cCI6MTc1MzMwOTMwOC40NDAwOTMsInN1YiI6IjljOTgyNzg5LTEwNTMtNGViYy04YjE2LWJlMmQxZmIxZjIyMSIsInNjb3BlcyI6WyJzaGlwcGluZy1jYWxjdWxhdGUiXX0.BvfhCRez6NXRl_rUcpM6Zs6T1l51oVus9gQabqWQYdM2aKA0BDRRXIdiKZuuF75edWrzxFGYChxAd0eSBhRMz3i3nJ4Q7_GZ9-vBC8VnTAEZhfUw3R955qQN-uEbB8SDs1Z7i11QKOqwCiveIDhTVuhPXc-gjIZFjMjrrj5PlIsjTgn_IcXtvkenRzDu7aFxTV64KrspDByWGXvEHt-ddJV5jZ8BYh5lxO4gWYvsYvasOUc_3a3XzylS9RDWjNdPtiJUtCFv7UaEMvuTKHpT0h0vCks00E0ejnhjRmh7tpl4MAk51HaMCm7CVWyyoiS_xq_8d5hUkvfx9rDgASaAdgaWZ-UAedrfoSLVWFsukRYvW8AeXmXCqcf7HM0q7RBofEBJfjZz2b39R5FBQL1Hqhyfx_2hQ9IzkQzK5lg7c687GwO3j74RhzWLHi-bwCBMemj_uReWVor23M_RPdyV3R8UK0gth7XWvKV1T7VUc9xwunt5jZitvM9-Gn3CYfTwYEQY1V6zI3-p-KEAKKGA2lUG3ZgWatW5uXp4KfYKOgByDKRa9Qb1Cmba8yArbGPKLbAAO-9R6WcGRYFDJNSZV_Xjjv4UXWdTMzzq-CzOVIB1Y3vNzpKAybcbFJquYDY63rgnYZCNig4R9DXMazRnFDZ6O4-9uRJ0A3n2iKa0QTc"

  // Mapeamento dos produtos
  const products = productsData.map((product) => ({
    id: product.id,
    width: parseFloat(product.largura),
    height: parseFloat(product.altura),
    length: parseFloat(product.profundidade),
    weight: parseFloat(product.peso) / 1000, // Convertendo gramas para kg
    insurance_value: parseFloat(product.valorvenda),
    quantity: 1,
  }));

  const body = {
    from: { postal_code: '96020360' }, // Substitua pelo CEP de origem
    to: { postal_code: zipCodeAdress },
    products,
  };

  try {
    // Chamada para a API de cálculo de frete
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Erro ao comunicar com a API de frete: ${response.statusText}`,
      });
    }

    const data = await response.json();

    // Retorna o cálculo do frete
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: `Erro interno ao calcular o frete: ${error.message}`,
    });
  }
})

router.get('/mercadopagosuccess', async (req, res) => {
  res.json({ success: 'deu certo' });
});

router.get('/mercadopagofailure', async (req, res) => {
  res.json({ error: 'deu errado' });
});

module.exports = router;
