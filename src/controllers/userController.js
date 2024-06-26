const knex = require('../config/connect');
const bcrypt = require('bcrypt');
const fs = require('fs');

const insertUser = async (req, res) => {
  const {
    nome,
    cpf,
    email,
    telefone,
    rua,
    bairro,
    cep,
    cidade,
    estado,
    senha,
    agencia,
    conta,
    pix,
    cargo_id,
  } = req.body;

  if (!nome || !email || !senha)
    return res.status(400).json({ error: 'Preencha todos os campos!' });

  if (!telefone || telefone.length < 11)
    return res.status(400).json({ error: 'Telefone inválido!' });

  if (!cpf || (cpf.length != 14 && cpf.length != 11))
    return res.status(400).json({ error: 'CPF inválido!' });

  try {
    const existPosition = await knex('cargos').where('id', cargo_id);
    if (existPosition.length === 0)
      return res.status(404).json({ error: 'Cargo não encontrado!' });

    const cpfValid = cpf.replaceAll('.', '').replace('-', '');
    const telefoneValid = telefone
      .replaceAll('(', '')
      .replaceAll(')', '')
      .replaceAll(' ', '')
      .replaceAll('+', '')
      .replaceAll('-', '');
    const existUser = await knex('usuarios')
      .where('email', email)
      .orWhere('cpf', cpfValid);

    if (existUser.length > 0)
      return res
        .status(400)
        .json({ error: 'O email ou CPF informados já existem!' });

    const passCrip = await bcrypt.hash(senha, 10);

    const newUser = {
      nome,
      email,
      telefone: telefoneValid,
      cpf: cpfValid,
      rua,
      bairro,
      cep,
      cidade,
      estado,
      agencia,
      conta,
      pix,
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

const updateUsers = async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    cpf,
    email,
    telefone,
    rua,
    bairro,
    cep,
    cidade,
    estado,
    agencia,
    conta,
    pix,
  } = req.body;
  if (
    !nome &&
    !email &&
    !cpf &&
    !rua &&
    !bairro &&
    !cep &&
    !cidade &&
    !estado &&
    !agencia &&
    !conta &&
    !pix &&
    !cpf &&
    !telefone
  )
    return res.status(400).json({ error: 'Sem alterações!' });

  if (cpf && cpf.length != 14 && cpf.length != 11)
    return res.status(400).json({ error: 'CPF inválido!' });
  if (telefone && telefone.length < 11)
    return res.status(400).json({ error: 'Telefone inválido!' });

  try {
    const user = await knex('usuarios').select('*').where('id', id);
    if (user.length === 0)
      return res.status(404).json({ error: 'Usuário não encontrado!' });

    const cpfValid = cpf ? cpf.replaceAll('.', '').replace('-', '') : '';
    const telefoneValid = telefone
      ? telefone
          .replaceAll('(', '')
          .replaceAll(')', '')
          .replaceAll(' ', '')
          .replaceAll('+', '')
          .replaceAll('-', '')
      : '';
    const emailValid = email ? email : '';
    const existUser = await knex('usuarios')
      .where('email', emailValid)
      .orWhere('cpf', cpfValid);

    if (existUser.length > 0 && email != user[0].email)
      return res
        .status(400)
        .json({ error: 'O email ou CPF informados já existem!' });

    const data = {
      nome: nome || user[0].nome,
      email: email || user[0].email,
      cargo_id: user[0].cargo_id,
      cpf: cpfValid || user[0].cpf,
      telefone: telefoneValid || user[0].telefone,
      rua: rua || user[0].rua,
      bairro: bairro || user[0].bairro,
      cep: cep || user[0].cep,
      cidade: cidade || user[0].cidade,
      estado: estado || user[0].estado,
      agencia: agencia || user[0].agencia,
      conta: conta || user[0].conta,
      pix: pix || user[0].pix,
    };

    await knex('usuarios').where('id', id).update(data).returning('*');

    return res.status(200).json({ success: 'Usuário atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const updateProfile = async (req, res) => {
  const { id, ...userAtual } = req.userLogged;
  const {
    nome,
    cpf,
    email,
    telefone,
    rua,
    bairro,
    cep,
    cidade,
    estado,
    agencia,
    conta,
    pix,
  } = req.body;
  if (
    !nome &&
    !email &&
    !cpf &&
    !rua &&
    !bairro &&
    !cep &&
    !cidade &&
    !estado &&
    !agencia &&
    !conta &&
    !pix &&
    !cpf &&
    !telefone
  )
    return res.status(400).json({ error: 'Sem alterações!' });

  if (cpf && cpf.length != 14 && cpf.length != 11)
    return res.status(400).json({ error: 'CPF inválido!' });
  if (telefone && telefone.length < 11)
    return res.status(400).json({ error: 'Telefone inválido!' });

  try {
    const cpfValid = cpf ? cpf.replaceAll('.', '').replace('-', '') : '';
    const telefoneValid = telefone
      ? telefone
          .replaceAll('(', '')
          .replaceAll(')', '')
          .replaceAll(' ', '')
          .replaceAll('+', '')
          .replaceAll('-', '')
      : '';
    const emailValid = email ? email : '';
    const existUser = await knex('usuarios')
      .where('email', emailValid)
      .orWhere('cpf', cpfValid);

    if (existUser.length > 0 && email != userAtual.email)
      return res
        .status(400)
        .json({ error: 'O email ou CPF informados já existem!' });

    const data = {
      nome: nome || userAtual.nome,
      email: email || userAtual.email,
      cargo_id: userAtual.cargo_id,
      cpf: cpfValid || userAtual.cpf,
      telefone: telefoneValid || userAtual.telefone,
      rua: rua || userAtual.rua,
      bairro: bairro || userAtual.bairro,
      cep: cep || userAtual.cep,
      cidade: cidade || userAtual.cidade,
      estado: estado || userAtual.estado,
      agencia: agencia || userAtual.agencia,
      conta: conta || userAtual.conta,
      pix: pix || userAtual.pix,
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
    //deletando todo produtos do consultor
    const productDeleted = await knex('consultor_produtos')
      .del()
      .where('consultor_id', id);
    if (productDeleted.rowCount === 0)
      return res.status(400).json({
        error: 'Não foi possível excluir o Produto, tente novamente!',
      });

    //deletando todos as vendas do consultor
    const requestDeleted = await knex('pedidos')
      .del()
      .where('consultor_id', id);
    if (requestDeleted.rowCount === 0)
      return res
        .status(400)
        .json({ error: 'Não foi possível excluir o Pedido, tente novamente!' });

    const withdrawDeleted = await knex('saques')
      .del()
      .where('consultor_id', id);
    if (withdrawDeleted.rowCount === 0)
      return res
        .status(400)
        .json({ error: 'Não foi possível excluir o Saque, tente novamente!' });

    const userDeleted = await knex('usuarios').del().where('id', id);
    if (userDeleted === 0)
      return res.status(404).json({ error: 'Usuário não encontrado!' });
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

const addImg = async (req, res) => {
  const { id } = req.userLogged;
  const file = req.file;
  try {
    if (!file)
      return res
        .status(400)
        .json({ error: 'Nenhuma imagem enviada, tente novamente!' });
    if (req.userLogged.srcperfil) {
      fs.unlinkSync(req.userLogged.srcperfil);
    }
    await knex('usuarios')
      .where('id', id)
      .update({ srcperfil: file.path })
      .returning('*');
    return res.json({ success: 'Imagem adicionada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const removeImg = async (req, res) => {
  const { id } = req.userLogged;
  try {
    if (req.userLogged.srcperfil) {
      fs.unlinkSync(req.userLogged.srcperfil);
      await knex('usuarios')
        .where('id', id)
        .update({ srcperfil: null })
        .returning('*');
      return res.json({ success: 'Foto do perfil removida com sucesso!' });
    } else {
      return res
        .status(400)
        .json({ error: 'Imagem não excluída, usuário sem foto do perfil!' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const addCert = async (req, res) => {
  const { id } = req.userLogged;
  const file = req.file;
  try {
    if (!file)
      return res
        .status(400)
        .json({ error: 'Nenhum arquivo enviado, tente novamente!' });
    if (req.userLogged.srccert) {
      fs.unlinkSync(req.userLogged.srccert);
    }
    await knex('usuarios')
      .where('id', id)
      .update({ srccert: file.path })
      .returning('*');
    return res.json({ success: 'Certificado adicionado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const removeCert = async (req, res) => {
  const { id } = req.userLogged;
  try {
    if (req.userLogged.srccert) {
      fs.unlinkSync(req.userLogged.srccert);
      await knex('usuarios')
        .where('id', id)
        .update({ srccert: null })
        .returning('*');
      return res.json({ success: 'Certificado removido com sucesso!' });
    } else {
      return res
        .status(400)
        .json({ error: 'Certificado não excluída, usuário sem anexo!' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

module.exports = {
  insertUser,
  getProfile,
  updateProfile,
  updateUsers,
  deleteProfile,
  listUsers,
  addImg,
  removeImg,
  addCert,
  removeCert,
};
