const knex = require('../config/connect');

//listar cargos
const listPositions = async (req, res) => {
  try {
    const positions = await knex('cargos');
    return res.status(200).json(positions);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro no servidor!' });
  }
};

//adicionar cargos
const addPosition = async (req, res) => {
  const { funcao } = req.body;
  if (!funcao)
    return res
      .status(400)
      .json({ mensagem: 'Informe a função que deseja cadastrar!' });
  try {
    const newPosition = {
      funcao,
    };
    const position = await knex('cargos').insert(newPosition).returning('*');
    return res
      .status(201)
      .json({ mensagem: 'Novo cargo cadastrado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro no servidor!' });
  }
};

//remover cargos
const removePosition = async (req, res) => {
  const { id } = req.params;

  try {
    const existPosition = await knex('cargos').where('id', id);
    if (existPosition.length === 0)
      return res.status(404).json({ mensagem: 'Cargo não encontrado!' });

    const excluded = await knex('cargos').del().where('id', id);
    if (excluded.rowCount === 0)
      return res.status(400).json({ mensagem: 'Cargo não excluído!' });

    return res.status(200).json({ mensagem: 'Cargo excluído com sucesso!' });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro no servidor!' });
  }
};

module.exports = {
  listPositions,
  addPosition,
  removePosition,
};
