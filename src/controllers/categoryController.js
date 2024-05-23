const knex = require('../config/connect');

//listar categorias
const listCategorys = async (req, res) => {
  try {
    const categorys = await knex('categorias');
    return res.status(200).json(categorys);
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

//adicionar categorias
const addCategory = async (req, res) => {
  const { categoria } = req.body;
  if (!categoria)
    return res
      .status(400)
      .json({ error: 'Informe a categoria que deseja cadastrar!' });
  try {
    const newCategory = {
      categoria,
    };
    const category = await knex('categorias')
      .insert(newCategory)
      .returning('*');
    return res
      .status(201)
      .json({ success: 'Nova categoria cadastrada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

//remover categoria
const removeCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const existCategory = await knex('categorias').where('id', id);
    if (existCategory.length === 0)
      return res.status(404).json({ error: 'Categoria não encontrada!' });

    const excluded = await knex('categorias').del().where('id', id);
    if (excluded.rowCount === 0)
      return res.status(400).json({ error: 'Categoria não excluída!' });

    return res.status(200).json({ success: 'Categoria excluída com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

module.exports = {
  listCategorys,
  addCategory,
  removeCategory,
};
