const knex = require('../config/connect');
const { dataAtualFormatada } = require('../functions/functions');

const addWithdraw = async (req, res) => {
  try {
    let valorsaque = 0;
    const pedidos_ids = [];
    const requests = await knex('pedidos')
      .where('consultpago', false)
      .where('consultor_id', req.userLogged.id)
      .where('saldodisp', true);

    requests.forEach(async (request) => {
      valorsaque += parseFloat(request.valorconsult);
      pedidos_ids.push(request.id);
      await knex('pedidos')
        .update({ consultpago: true })
        .where('id', request.id);
    });

    const datasaque = dataAtualFormatada();
    const data = {
      datasaque,
      valorsaque,
      pedidos_ids,
    };

    await knex('saques').insert(data);
    return res.json({ success: 'Saque solicitado com sucesso!' });
  } catch (error) {
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

module.exports = {
  addWithdraw,
  listWithdraws,
  removeWithdraw,
};
