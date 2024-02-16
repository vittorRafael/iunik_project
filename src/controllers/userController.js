const knex = require('../config/connect');
const bcrypt = require('bcrypt');

const insertUser = async (req, res) => {
  const { nome, sobrenome, email, senha, cargo } = req.body;

  if (!nome || !email || !senha || !cargo) {
    return res.status(404).json({ mensagem: 'Preencha todos os campos!' });
  }

  try {
    const existUser = await knex('usuarios').where('email', email);
    console.log(existUser);

    if (existUser.length > 0) {
      return res.status(400).json({ mensagem: 'O email informado já existe!' });
    }

    const passCrip = await bcrypt.hash(senha, 10);

    const newUser = {
      nome,
      email,
      senha: passCrip,
      nome_loja,
    };

    const user = await knex('usuarios').insert(newUser).returning('*');

    if (user.length === 0) {
      return res.status(400).json({
        mensagem: 'Ocorreu um erro ao cadastrar o usuário, tente novamente!',
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

/* const obterPerfil = async (req, res) => {
    return res.status(200).json(req.usuario);
} */

module.exports = {
  insertUser,
};
