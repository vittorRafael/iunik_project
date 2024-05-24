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
    let valorresto = 0;
    let pedido_resto_id = 0;
    const pedidos_ids = [];
    const requests = await knex('pedidos')
      .where('consultpago', false)
      .where('consultor_id', req.userLogged.id)
      .where('saldodisp', true);

    const requestRest = await knex('pedidos')
      .where('resto', '>', 0)
      .where('consultor_id', req.userLogged.id);
    if (requestRest.length > 0) {
      pedidos_ids.push(requestRest[0].id);
      valortotal = parseFloat(requestRest[0].resto);
      await knex('pedidos')
        .update({ resto: 0.0, consultpago: true })
        .where('id', requestRest[0].id);
      valorresto = valortotal;
      pedido_resto_id = requestRest[0].id;
    } else {
      if (valorsaque == req.userLogged.valordispsaque) {
        console.log('entrou aqui 1');
        for (let request of requests) {
          pedidos_ids.push(request.id);
          valortotal += parseFloat(request.valorconsult);
          await knex('pedidos')
            .update({ consultpago: true })
            .where('id', request.id);
        }
      }
    }

    if (valortotal < valorsaque) {
      for (let request of requests) {
        pedidos_ids.push(request.id);
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
    } else {
      if (requestRest.length > 0) {
        const resto = valortotal - valorsaque;
        await knex('pedidos')
          .update({ consultpago: true, resto: resto.toFixed(2) })
          .where('id', requestRest[0].id);
      }
    }

    const valordispsaque =
      parseFloat(req.userLogged.valordispsaque) - valorsaque;
    await knex('usuarios')
      .update({
        valordispsaque: valordispsaque.toFixed(2),
      })
      .where('id', req.userLogged.id);

    const datasaque = dataAtualFormatada();
    const data = {
      datasaque,
      valorsaque,
      valorresto,
      pedido_resto_id,
      pedidos_ids,
      consultor_id: req.userLogged.id,
    };

    await knex('saques').insert(data);
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

const addComprov = async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  try {
    const withdraw = await knex('saques').select('*').where('id', id);
    if (withdraw.length === 0)
      return res.status(404).json({ error: 'Saque não encontrado!' });
    if (withdraw[0].srccomp) {
      fs.unlinkSync(withdraw[0].srccomp);
    }

    const moviments = await knex('movimentacoes')
      .select('*')
      .where('saque_id', id);
    if (moviments.length === 0) {
      const moviment = {
        tipo: 'saída',
        valor: withdraw[0].valorsaque,
        saque_id: id,
      };
      await knex('movimentacoes').insert(moviment);
    }

    await knex('saques')
      .where('id', id)
      .update({ srccomp: file.path, status: 'realizado' })
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
        .update({ srccomp: null, status: 'pendente' })
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
  addComprov,
  removeComprov,
};
