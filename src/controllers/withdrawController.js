const knex = require('../config/connect');
const { dataAtualFormatada } = require('../functions/functions');
const fs = require('fs');

const addWithdraw = async (req, res) => {
  try {
    const valorsaque = parseFloat(req.body.valorsaque);
    if (isNaN(valorsaque))
      return res.status(400).json({ error: 'Informe o valor para saque!' });

    if (valorsaque > req.userLogged.valordispsaque)
      return res
        .status(400)
        .json({ error: 'Sem valor disponível para saque!' });

    let valortotal = 0;
    const requests = await knex('pedidos')
      .where('consultpago', false)
      .where('consultor_id', req.userLogged.id)
      .where('saldodisp', true);

    const requestRest = await knex('pedidos').where('resto', '>', 0);
    if (requestRest.length > 0) {
      valortotal = parseFloat(requestRest[0].resto);
      await knex('pedidos')
        .update({ resto: 0.0, consultpago: true })
        .where('id', requestRest[0].id);
    }

    for (let request of requests) {
      valortotal += parseFloat(request.valorconsult);
      await knex('pedidos')
        .update({ consultpago: true })
        .where('id', request.id);
      if (valortotal > valorsaque) {
        const resto = valortotal - valorsaque;
        await knex('pedidos')
          .update({ consultpago: null, resto: resto.toFixed(2) })
          .where('id', request.id);
        break;
      }
    }

    const valordispsaque =
      parseFloat(req.userLogged.valordispsaque) - valorsaque;
    await knex('usuarios')
      .update({
        valordispsaque: valordispsaque.toFixed(2),
      })
      .where('id', req.userLogged.id);

    /* const datasaque = dataAtualFormatada();
    const data = {
      datasaque,
      valorsaque,
      consultor_id: req.userLogged.id,
    };

    await knex('saques').insert(data); */
    return res.json({ success: 'Saque solicitado com sucesso!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const listWithdraws = async (req, res) => {
  const { id } = req.params;
  try {
    if (id < 1) {
      const withdraws = await knex('saques').select('*');
      return res.status(200).json(withdraws);
    } else {
      const withdraw = await knex('saques').select('*').where('id', id);
      if (withdraw.length === 0)
        return res.status(404).json({ error: 'Saque não encontrado!' });
      return res.status(200).json(withdraw[0]);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const removeWithdraw = async (req, res) => {
  const { id } = req.params;
  try {
    const withdraw = await knex('saques').where('id', id);

    if (withdraw.length === 0)
      return res.status(404).json({ error: 'Saque não encontrado!' });
    if (withdraw[0].status == 'pago')
      return res.status(400).json({
        error:
          'Não é possível excluir o saque, pois o pagamento ja está realizado!',
      });

    withdraw[0].pedidos_ids.forEach(async (Pedido_id) => {
      await knex('pedidos')
        .update({ consultpago: false })
        .where('id', Pedido_id);
    });

    const withdrawDeleted = await knex('saques').del().where('id', id);
    if (withdrawDeleted.rowCount === 0)
      return res
        .status(400)
        .json({ error: 'Não foi possível excluir o saque, tente novamente!' });

    return res
      .status(200)
      .json({ success: 'Solicitação do saque excluída com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const addComprov = async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  try {
    if (req.userLogged.srcperfil) {
      fs.unlinkSync(req.userLogged.srcperfil);
    }
    await knex('saques')
      .where('id', id)
      .update({ srccomp: file.path })
      .returning('*');
    return res.json({ success: 'Comprovante adicionado com sucesso!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const removeComprov = async (req, res) => {
  const { id } = req.params;
  try {
    const withdraws = await knex('saques').where('id', id);
    if (withdraws.length === 0)
      return res.status(404).json({ error: 'Saque não encontrado!' });

    if (withdraws[0].srccomp) {
      fs.unlinkSync(withdraws[0].srccomp);
      await knex('saques')
        .where('id', id)
        .update({ srccomp: null })
        .returning('*');
      return res.json({ success: 'Comprovante removido com sucesso!' });
    } else {
      return res.status(400).json({
        error: 'Comprovante não excluído, saque não possui comprovante!',
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

module.exports = {
  addWithdraw,
  listWithdraws,
  removeWithdraw,
  addComprov,
  removeComprov,
};
