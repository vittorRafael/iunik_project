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
  const { formapag_id, produtos_ids, modelo } = req.body;
  const valorfrete = parseFloat(req.body.valorfrete) || 0;

  let user_id = req.userLogged.id;
  let consultor_id = 1;
  let cliente_id = 1;
  let valorconsult = 0;
  let valor = 0;

  if (!produtos_ids || !modelo)
    return res.status(400).json({ error: 'Preencha todos os campos!' });
  try {
    if (formapag_id) {
      const existFormPag = await knex('formaspagamento').where(
        'id',
        formapag_id,
      );
      if (existFormPag.length === 0)
        return res
          .status(400)
          .json({ error: 'Forma de pagamento inválida, tente novamente!' });
    }

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
      });
    } else {
      consultor_id = user_id;

      const products = await knex('consultor_produtos')
        .select(['*', 'consultor_produtos.id'])
        .whereIn('consultor_produtos.produto_id', produtos_ids)
        .where('produtos.inativo', false)
        .where('consultor_produtos.consultor_id', consultor_id)
        .innerJoin('produtos', 'produtos.id', 'consultor_produtos.produto_id');
      if (products.length !== produtos_ids.length)
        return res
          .status(400)
          .json({ error: 'Produto selecionado não existe, tente novamente!' });

      products.forEach(async (product) => {
        valorconsult += parseFloat(product.valorconsult);
        valor += parseFloat(product.valortotal);
      });
    }

    const datapedido = dataAtualFormatada();

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
    if (request.length === 0)
      return res.status(404).json({ error: 'Pedido não encontrado!' });
    const { statuspag, statusentrega } = req.body;
    if (!statusentrega && !statuspag)
      return res.status(400).json({ error: 'Nenhuma alteração encontrada!' });

    const data = {
      statusentrega,
      statuspag,
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
        request.formapag_id === 1 &&
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

module.exports = {
  listRequests,
  addRequest,
  editRequest,
  removeRequest,
  balanceAvailable,
  getBalance,
};
