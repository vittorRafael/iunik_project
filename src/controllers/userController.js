const knex = require('../config/connect');
const bcrypt = require('bcrypt');

const insertUser = async (req, res) => {
  const { nome, sobrenome, email, senha, cargo_id } = req.body;

  if (!nome || !email || !senha)
    return res.status(400).json({ error: 'Preencha todos os campos!' });

  const existPosition = await knex('cargos').where('id', cargo_id);
  if (existPosition.length === 0)
    return res.status(404).json({ error: 'Cargo não encontrado!' });

  try {
    const existUser = await knex('usuarios').where('email', email);

    if (existUser.length > 0)
      return res.status(400).json({ error: 'O email informado já existe!' });

    const passCrip = await bcrypt.hash(senha, 10);

    const newUser = {
      nome,
      sobrenome,
      email,
      senha: passCrip,
      cargo_id,
    };

    const user = await knex('usuarios').insert(newUser).returning('*');

    if (user.length === 0)
      return res.status(400).json({
        error: 'Ocorreu um erro ao cadastrar o usuário, tente novamente!',
      });

    return res.status(200).json({ success: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const getProfile = async (req, res) => {
  return res.status(200).json(req.userLogged);
};

const updateProfile = async (req, res) => {
  const { id, ...userAtual } = req.userLogged;
  const { nome, sobrenome, email, cargo_id } = req.body;
  if (!nome && !sobrenome && !email && !cargo_id)
    return res.status(400).json({ error: 'Sem alterações!' });

  const existUser = knex('usuarios').select('*').where('email', email);
  if (existUser.length > 0)
    return res.status(400).json({ error: 'O email informado já existe!' });
  try {
    const data = {
      nome: nome || userAtual.nome,
      sobrenome: sobrenome || userAtual.sobrenome,
      email: email || userAtual.email,
      cargo_id: cargo_id || userAtual.cargo_id,
    };

    await knex('usuarios').where('id', id).update(data).returning('*');

    return res.status(200).json({ success: 'Usuário atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const deleteProfile = async (req, res) => {
  const { id } = req.userLogged;

  try {
    const userDeleted = await knex('usuarios').del().where('id', id);
    if (userDeleted.rowCount === 0)
      return res.status(400).json({ error: 'O usuário não foi excluido!' });

    return res.status(200).json({ success: 'Usuário excluído com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const listUsers = async (req, res) => {
  const { id } = req.params;
  try {
    if (id < 1) {
      const users = await knex('usuarios').select('*');
      return res.status(200).json(users);
    } else {
      const user = await knex('usuarios').select('*').where('id', id);
      if (user.length === 0)
        return res.status(404).json({ error: 'Usuário não encontrado!' });
      return res.status(200).json(user[0]);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

module.exports = {
  insertUser,
  getProfile,
  updateProfile,
  deleteProfile,
  listUsers,
};
