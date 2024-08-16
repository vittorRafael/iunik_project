const knex = require('../config/connect');

const checkActivate = async (req, res, next) => {
  try {
  if (req.userLogged.status.toLowerCase() != 'ativo')
  return res.status(401).json({
    error: 'Seu usuário não está ativo, tente novamente!.',
  });

  next()
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
  
}

module.exports = checkActivate