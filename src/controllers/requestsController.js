const knex = require('../config/connect');
const { dataAtualFormatada, compararDatas } = require('../functions/functions');

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
  const { consultor_id, cliente_id, formapag_id, produtos_ids } = req.body;
  if (!consultor_id || !cliente_id || !formapag_id || !produtos_ids)
    return res.status(400).json({ error: 'Preencha todos os campos!' });

  try {
    const existFormPag = await knex('formaspagamento').where('id', formapag_id);
    if (existFormPag.length === 0)
      return res
        .status(400)
        .json({ error: 'Forma de pagamento inválida, tente novamente!' });
    const existConsult = await knex('usuarios')
      .where('id', consultor_id)
      .where('cargo_id', 3);
    if (existConsult.length === 0)
      return res
        .status(400)
        .json({ error: 'O consultor não existe, tente novamente!' });

    const existCliente = await knex('usuarios')
      .where('id', cliente_id)
      .where('cargo_id', 4);
    if (existCliente.length === 0)
      return res
        .status(400)
        .json({ error: 'O cliente não existe, tente novamente!' });

    const products = await knex('produtos')
      .whereIn('id', produtos_ids)
      .where('inativo', false);
    if (products.length !== produtos_ids.length)
      return res
        .status(400)
        .json({ error: 'Produto selecionado não existe, tente novamente!' });

    let valorconsult = 0;
    let valor = 0;
    products.forEach(async (product) => {
      valorconsult += parseFloat(product.valorconsult);
      valor += parseFloat(product.valortotal);
    });
    const datapedido = dataAtualFormatada();

    const newRequest = {
      datapedido,
      formapag_id,
      valor: valor.toFixed(2),
      valorconsult: valorconsult.toFixed(2),
      consultor_id,
      cliente_id,
      produtos_ids,
    };

    await knex('pedidos').insert(newRequest).returning('*');

    return res.status(200).json({ success: 'Pedido cadastrado com sucesso!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const editRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const request = await knex('pedidos').where('id', id);
    const { consultor_id, cliente_id } = req.body;
    let valor = req.body.valor;
    if (!valor && !consultor_id && !cliente_id)
      return res.status(400).json({ error: 'Nenhuma alteração encontrada!' });

    if (consultor_id) {
      const existConsult = await knex('usuarios')
        .where('id', consultor_id)
        .where('cargo_id', 3);
      if (existConsult.length === 0)
        return res
          .status(404)
          .json({ error: 'O consultor não existe, tente novamente!' });
    }

    if (cliente_id) {
      const existCliente = await knex('usuarios')
        .where('id', cliente_id)
        .where('cargo_id', 4);
      if (existCliente.length === 0)
        return res
          .status(404)
          .json({ error: 'O cliente não existe, tente novamente!' });
    }

    valor = valor ?? request[0].valor;
    const valorconsult = valor * 0.4;

    const data = {
      dataPedido: request[0].dataPedido,
      valor: parseFloat(valor).toFixed(2),
      valorconsult: valorconsult.toFixed(2),
      consultor_id: consultor_id ?? request[0].consultor_id,
      cliente_id: cliente_id ?? request[0].cliente_id,
    };

    await knex('pedidos').where('id', id).update(data).returning('*');

    return res.status(200).json({ success: 'Pedido atualizado com sucesso!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const removeRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const requestDeleted = await knex('pedidos').del().where('id', id);
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
      .where('consultor_id', req.userLogged.id)
      .where('saldodisp', false);

    requests.forEach(async (request) => {
      const today = dataAtualFormatada();
      if (
        request.formapag_id === 1 &&
        compararDatas(today, request.datapedido, 7)
      ) {
        await knex('pedidos')
          .update({ saldodisp: true })
          .where('id', request.id);
      } else if (
        request.formapag_id === 4 &&
        compararDatas(today, request.datapedido, 30)
      ) {
        await knex('pedidos')
          .update({ saldodisp: true })
          .where('id', request.id);
      }
    });

    res.status(200).json({ success: 'Dados Atualizados!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const getBalance = async (req, res) => {
  try {
    const requestsSaldo = await knex('pedidos')
      .where('consultpago', false)
      .where('consultor_id', req.userLogged.id)
      .where('saldodisp', true);

    let saldodisp = 0;

    requestsSaldo.forEach(async (request) => {
      saldodisp += parseFloat(request.valorconsult);
    });

    return res.status(200).json({ saldodisp });
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
};
