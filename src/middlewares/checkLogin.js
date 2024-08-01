const jwt = require('jsonwebtoken');
const knex = require('../config/connect');

const checkLogin = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization)
    return res.status(401).json({
      error:
        'Para acessar este recurso um token de autenticação válido deve ser enviado!',
    });

  try {
    const token = authorization.split(' ')[1];

    const userLogged = await jwt.verify(token, process.env.JWT_PASS);
    const existUser = await knex('usuarios').where('id', userLogged.usuario.id);
    if (existUser.length === 0)
      return res.status(401).json({
        error: 'Sua sessão terminou, por favor efetue novamente seu login.',
      });

    if (userLogged.status != 'Ativo')
      return res.status(401).json({
        error: 'Seu usuário não está ativo, tente novamente!.',
      });
    const { senha: _, ...data } = existUser[0];
    req.userLogged = data;
    next();
  } catch (error) {
    if (error.message === 'jwt expired') {
      return res.status(401).json({
        error: 'Sua sessão terminou, por favor efetue novamente seu login.',
      });
    }
    if (error.message === 'jwt must be provided')
      return res.status(401).json({
        error:
          'Para acessar este recurso um token de autenticação necessário deve ser enviado.',
      });

    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

module.exports = checkLogin;
