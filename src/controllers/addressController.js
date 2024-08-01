const knex = require('../config/connect');

const addAddress = async (req, res) => {
  const { rua, bairro, complemento, numero, cep, cidade, estado, usuario_id } =
    req.body;
  if (!rua || !bairro || !numero || !cep || !cidade || !estado || !usuario_id)
    return res.status(400).json({ error: 'Preencha todos os campos!' });
  try {
    const usuario = await knex('usuarios').where('id', usuario_id).first();
    if (!usuario)
      return res.status(404).json({ error: 'Usuário não encontrado' });

    const data = {
      rua,
      bairro,
      complemento,
      numero,
      cep,
      cidade,
      estado,
      usuario_id,
    };

    await knex('enderecos').insert(data);
    return res
      .status(201)
      .json({ success: 'Endereço adicionado com sucesso!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};
const listAddress = async (req, res) => {
  const { id } = req.params;
  try {
    if (id < 1) {
      const address = await knex('enderecos').select('*');
      return res.status(200).json(address);
    } else {
      const usuario = await knex('usuarios').where('id', id).first();
      if (!usuario)
        return res.status(404).json({ error: 'Usuário não encontrado' });
      const address = await knex('enderecos')
        .select('*')
        .where('usuario_id', id);
      if (address.length === 0)
        return res.status(404).json({ error: 'Endereço não encontrado!' });
      return res.status(200).json(address);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};
const editAddress = async (req, res) => {
  const { id } = req.params;
  const { rua, bairro, complemento, numero, cep, cidade, estado } = req.body;

  if (!rua && !bairro && !numero && !cep && !cidade && !estado && !complemento)
    return res.status(400).json({ error: 'Nenhuma alteração encontrada!' });

  try {
    const endereco = await knex('enderecos').where('id', id).first();
    if (!endereco)
      return res.status(404).json({ error: 'Endereço não encontrado' });

    const data = {
      rua: rua ?? endereco.rua,
      bairro: bairro ?? endereco.bairro,
      numero: numero ?? endereco.numero,
      cep: cep ?? endereco.cep,
      cidade: cidade ?? endereco.cidade,
      estado: estado ?? endereco.estado,
      complemento: complemento ?? endereco.complemento,
    };

    await knex('enderecos').where('id', id).update(data);
    return res
      .status(200)
      .json({ success: 'Endereço atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};
const deleteAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const existAddress = await knex('enderecos').where('id', id);
    if (existAddress.length === 0)
      return res.status(404).json({ error: 'Endereço não encontrado!' });

    const excluded = await knex('enderecos').del().where('id', id);
    if (excluded.rowCount === 0)
      return res.status(400).json({ error: 'Endereço não excluído!' });

    return res.status(200).json({ success: 'Endereço excluído com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

module.exports = { addAddress, listAddress, editAddress, deleteAddress };
