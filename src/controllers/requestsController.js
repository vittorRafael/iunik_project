const knex = require('../config/connect');
const {
  dataAtualFormatada,
  compararDatas,
  convertToISO8601,
  adicionarMes,
} = require('../functions/functions');
const { MercadoPagoConfig, Preference } = require('mercadopago');
require('dotenv').config();
const mailer = require('../modules/mailer');

const client = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN || '',
});

const listRequests = async (req, res) => {
  const { id } = req.params;
  try {
    if (id < 1) {
      const requests = await knex('pedidos').select('*');
      return res.status(200).json(requests);
    } else {
      const request = await knex('pedidos').select('*').where('id', id);
      if (request.length === 0)
        return res.status(404).json({ error: 'Pedido não encontrado!' });
      return res.status(200).json(request[0]);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const addRequest = async (req, res) => {
  const {
    formapag_id,
    produtos_ids,
    modelo,
    rua,
    numero,
    bairro,
    cep,
    cidade,
    estado,
    complemento,
  } = req.body;
  const valorfrete = parseFloat(req.body.valorfrete) || 0;
  const admins = await knex('usuarios').where('cargo_id', 1);

  let user_id = req.userLogged.id;
  let consultor_id = 1;
  let cliente_id = 1;
  let valorconsult = 0;
  let valor = 0;
  const items = [];

  if (
    !produtos_ids ||
    !modelo ||
    !rua ||
    !numero ||
    !bairro ||
    !cep ||
    !cidade ||
    !estado ||
    !complemento
  )
    return res.status(400).json({ error: 'Preencha todos os campos!' });
  try {
    const existConsult = await knex('usuarios')
      .where('id', user_id)
      .where('cargo_id', 4);
    if (existConsult.length === 0) {
      const existCliente = await knex('usuarios')
        .where('id', user_id)
        .where('cargo_id', 5);
      if (existCliente.length === 0)
        return res
          .status(400)
          .json({ error: 'O cliente não existe, tente novamente!' });

      cliente_id = user_id;

      const products = await knex('produtos')
        .select('*')
        .whereIn('id', produtos_ids)
        .where('inativo', false);

      if (products.length !== produtos_ids.length)
        return res
          .status(400)
          .json({ error: 'Produto selecionado não existe, tente novamente!' });

      products.forEach(async (product) => {
        valor += parseFloat(product.valorvenda);
        items.push({
          id: product.id,
          title: product.nome,
          currency_id: 'BRL',
          picture_url: product.imagens ? product.imagens[0] : '',
          description: product.descricao,
          category_id: product.categoria_id,
          quantity: 1,
          unit_price: parseFloat(product.valorvenda),
        });
      });
    } else {
      consultor_id = user_id;

      const products = await knex('consultor_produtos')
        .select(['*', 'consultor_produtos.id'])
        .whereIn('consultor_produtos.produto_id', produtos_ids)
        .where('produtos.inativo', false)
        .where('consultor_produtos.consultor_id', consultor_id)
        .innerJoin('produtos', 'produtos.id', 'consultor_produtos.produto_id');
      if (products.length !== produtos_ids.length) {
        products.forEach((product) => {
          if (produtos_ids.includes(product.produto_id)) {
            const index = produtos_ids.indexOf(product.produto_id);
            produtos_ids.splice(index, 1);
          }
        });
        const productsGeneral = await knex('produtos')
          .select('*')
          .whereIn('id', produtos_ids)
          .where('inativo', false);

        if (productsGeneral.length !== produtos_ids.length)
          return res.status(400).json({
            error: 'Produto selecionado não existe, tente novamente!',
          });

        productsGeneral.forEach((productGeneral) => {
          products.push(productGeneral);
        });
      }
      products.forEach(async (product) => {
        if (product.valorconsult) {
          valorconsult += parseFloat(product.valorconsult);
          valor += parseFloat(product.valortotal);
          items.push({
            id: product.id,
            title: product.nome,
            currency_id: 'BRL',
            picture_url: product.imagens ? product.imagens[0] : '',
            description: product.descricao,
            category_id: product.categoria_id,
            quantity: 1,
            unit_price: parseFloat(product.valortotal),
          });
        } else {
          valorconsult += 1.0;
          valor += parseFloat(product.valormin);
          items.push({
            id: product.id,
            title: product.nome,
            currency_id: 'BRL',
            picture_url: product.imagens ? product.imagens[0] : '',
            description: product.descricao,
            category_id: product.categoria_id,
            quantity: 1,
            unit_price: parseFloat(product.valormin),
          });
        }
      });
    }

    const datapedido = dataAtualFormatada();

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items,
        back_urls: {
          success: 'http://localhost:3000/mercadopagosuccess',
          failure: 'http://localhost:3000/mercadopagofailure',
        },
        auto_return: 'approved',
      },
    });

    const newRequest = {
      datapedido,
      formapag_id,
      valor: valor.toFixed(2),
      valorconsult: valorconsult.toFixed(2),
      valorfrete: valorfrete.toFixed(2),
      consultor_id,
      cliente_id,
      produtos_ids,
      modelo,
      rua,
      numero,
      bairro,
      cep,
      cidade,
      estado,
      complemento,
      mercadopago_id: response.id,
      linkpagamento: response.init_point,
    };

    const request = await knex('pedidos').insert(newRequest).returning('*');

    admins.forEach((admin) => {
      mailer.sendMail(
        {
          to: admin.email,
          from: process.env.FROM_MAIL,
          template: './addRequest',
          subject: `(BIODERMIS) - Pedido n° ${request[0].id}`,
          context: {
            qtdProdutos: produtos_ids.length,
            valor: valor.toFixed(2),
            id: request[0].id,
          },
        },
        (err) => {
          if (err)
            return res.status(400).json({
              error: 'Não foi possível enviar o email, tente novamente!',
            });
        },
      );
    });

    return res.status(200).json({
      success: 'Pedido cadastrado com sucesso!',
      link: response.init_point,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const editRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const request = await knex('pedidos').where('id', id);
    if (request.length === 0)
      return res.status(404).json({ error: 'Pedido não encontrado!' });
    const {
      statuspag,
      statusentrega,
      formapag_id,
      rua,
      numero,
      bairro,
      cep,
      cidade,
      estado,
      complemento,
      modelo,
      dataenvio,
      formaEnvio,
      codigoRastreio,
    } = req.body;
    if (
      !statusentrega &&
      !statuspag &&
      !formapag_id &&
      !rua &&
      !numero &&
      !bairro &&
      !cep &&
      !cidade &&
      !complemento &&
      !estado &&
      !modelo &&
      !codigoRastreio &&
      !dataenvio &&
      !formaEnvio
    )
      return res.status(400).json({ error: 'Nenhuma alteração encontrada!' });

    if (statuspag == 'realizado' && !formapag_id)
      return res
        .status(400)
        .json({ error: 'Forma de pagamento não identificada!' });

    if (formapag_id) {
      const formapag = await knex('formaspagamento').where('id', formapag_id);
      if (formapag.length === 0)
        return res
          .status(404)
          .json({ error: 'Forma de pagamento não identificada!' });
    }

    if (statuspag == 'realizado') {
      const moviments = await knex('movimentacoes')
        .select('*')
        .where('pedido_id', id);
      if (moviments.length === 0) {
        const moviment = {
          tipo: 'entrada',
          valor: request[0].valor,
          pedido_id: id,
        };
        await knex('movimentacoes').insert(moviment);
      }
    }

    if (
      request[0].statusentrega !== 'pendente' &&
      (rua || numero || bairro || cep || cidade || complemento || estado)
    ) {
      return res.status(400).json({
        error: 'Não é possível modificar o endereço, entrega em andamento!',
      });
    }

    let client = await knex('usuarios').where('id', request[0].consultor_id);
    if (client.length === 0)
      client = await knex('usuarios').where('id', request[0].cliente_id);

    if (codigoRastreio && dataenvio && formaEnvio) {
      mailer.sendMail(
        {
          to: client[0].email,
          from: process.env.FROM_MAIL,
          template: './confirmShipping',
          subject: `(BIODERMIS) - Pedido n° ${request[0].id} enviado!`,
          context: {
            codigoRastreio,
            formaEnvio,
            dataenvio,
            id: request[0].id,
          },
        },
        (err) => {
          if (err)
            return res.status(400).json({
              error: 'Não foi possível enviar o email, tente novamente!',
            });
        },
      );
    } else if (
      codigoRastreio &&
      dataenvio &&
      formaEnvio &&
      statuspag !== 'realizado'
    ) {
      return res.json({
        error:
          'Não foi possível alterar as informações de entrega, pagamento pendente!',
      });
    }

    const data = {
      statusentrega: statusentrega ?? request[0].statusentrega,
      statuspag: statuspag ?? request[0].statuspag,
      formapag_id: formapag_id ?? request[0].formapag_id,
      rua: rua ?? request[0].rua,
      numero: numero ?? request[0].numero,
      bairro: bairro ?? request[0].bairro,
      cep: cep ?? request[0].cep,
      cidade: cidade ?? request[0].cidade,
      estado: estado ?? request[0].estado,
      complemento: complemento ?? request[0].complemento,
      modelo: modelo ?? request[0].modelo,
    };

    await knex('pedidos').where('id', id).update(data).returning('*');

    return res.status(200).json({ success: 'Pedido atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const removeRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const requestDeleted = await knex('pedidos')
      .del()
      .where('id', id)
      .where({ saldodisp: false })
      .where({ consultpago: false });
    if (requestDeleted === 0)
      return res.status(404).json({
        error: 'Pedido não encontrado ou pagamento já foi realizado!',
      });
    if (requestDeleted.rowCount === 0)
      return res
        .status(400)
        .json({ error: 'Não foi possível excluir o Pedido, tente novamente!' });

    return res.status(200).json({ success: 'Pedido excluído com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const balanceAvailable = async (req, res) => {
  try {
    const requests = await knex('pedidos')
      .where('consultpago', false)
      .where('saldodisp', false);

    requests.forEach(async (request) => {
      const today = dataAtualFormatada();
      const res = await knex('usuarios')
        .select('valordispsaque')
        .where('id', request.consultor_id);
      const valordispsaque =
        parseFloat(res[0].valordispsaque) + parseFloat(request.valorconsult);
      if (
        (request.formapag_id === 1 ||
          request.formapag_id === 3 ||
          request.formapag_id === 4) &&
        compararDatas(today, request.datapedido, 7) &&
        request.statuspag == 'realizado'
      ) {
        await knex('pedidos')
          .update({ saldodisp: true })
          .where('id', request.id);
        await knex('usuarios')
          .update({
            valordispsaque: valordispsaque.toFixed(2),
          })
          .where('id', request.consultor_id);
      } else if (
        request.formapag_id === 2 &&
        compararDatas(today, request.datapedido, 30) &&
        request.statuspag == 'realizado'
      ) {
        await knex('pedidos')
          .update({ saldodisp: true })
          .where('id', request.id);
        await knex('usuarios')
          .update({
            valordispsaque: valordispsaque.toFixed(2),
          })
          .where('id', request.consultor_id);
      }
    });

    res.status(200).json({ success: 'Dados Atualizados!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const getBalance = async (req, res) => {
  const { id } = req.userLogged;
  try {
    const requestsSaldo = await knex('pedidos')
      .where('consultpago', false)
      .where('consultor_id', id)
      .where('saldodisp', true);

    let saldodisp = 0;

    requestsSaldo.forEach(async (request) => {
      saldodisp += parseFloat(request.valorconsult);
    });

    const requestRest = await knex('pedidos').where('resto', '>', 0);
    if (requestRest.length > 0) {
      saldodisp += parseFloat(requestRest[0].resto);
    }

    return res.status(200).json({ saldodisp });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const listPreferenceRequest = async (req, res) => {
  const { preferenceId } = req.params;
  try {
    const request = await knex('pedidos')
      .select('*')
      .where('mercadopago_id', preferenceId);
    return res.status(200).json(request[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

module.exports = {
  listRequests,
  addRequest,
  editRequest,
  removeRequest,
  balanceAvailable,
  getBalance,
  listPreferenceRequest,
};
