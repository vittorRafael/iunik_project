const express = require('express');
const router = express();
const userController = require('../controllers/userController');

// cadastro de usuario
router.post('/usuarios', userController.insertUser);

/* // login
rotas.post('/login', login.login);

// filtro para verificar usuario logado
rotas.use(verificaLogin);

// obter e atualizar perfil do usuario logado
rotas.get('/perfil', userController.obterPerfil);
rotas.put('/perfil', userController.atualizarPerfil); */

module.exports = router;
