const knex = require('../config/connect');

const listConsults = async (req, res) => {
  const { id } = req.params;
  try {
    if (id < 1) {
      const users = await knex('usuarios').select('*').where('cargo_id', 3);
      return res.status(200).json(users);
    } else {
      const user = await knex('usuarios')
        .select('*')
        .where('id', id)
        .where('cargo_id', 3);
      if (user.length === 0)
        return res.status(404).json({ error: 'Usuário não encontrado!' });
      return res.status(200).json(user[0]);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const bloqConsult = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await knex('usuarios')
      .where('id', id)
      .update({ inativo: !req.userLogged.inativo })
      .returning('*');

    return res.status(200).json({ success: 'Status alterado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

module.exports = { listConsults, bloqConsult };
