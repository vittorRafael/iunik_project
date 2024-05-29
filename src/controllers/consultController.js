const knex = require('../config/connect');

const listConsults = async (req, res) => {
  const { id } = req.params;
  try {
    if (id < 1) {
      const users = await knex('usuarios').select('*').where('cargo_id', 4);
      return res.status(200).json(users);
    } else {
      const user = await knex('usuarios')
        .select('*')
        .where('id', id)
        .where('cargo_id', 4);
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
  const { opt } = req.body;
  if (!opt || (opt != 1 && opt != 2 && opt != 3))
    return res.status(400).json({ error: 'Opção não identificada!' });

  let optText =
    opt == 1 ? 'Ativo' : opt == 2 ? 'Em aprovação' : opt == 3 ? 'Inativo' : '';

  try {
    const user = await knex('usuarios')
      .where('id', id)
      .update({ status: optText })
      .returning('*');

    return res.status(200).json({ success: 'Status alterado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const addProductConsult = async (req, res) => {
  const produto_id = req.params.id;
  const valorprod = parseFloat(req.body.valorprod);

  try {
    const product = await knex('produtos')
      .where('id', produto_id)
      .where('inativo', false);
    if (product.length === 0)
      return res.status(404).json({ error: 'Produto não encontrado!' });

    const productConsult = await knex('consultor_produtos')
      .where('produto_id', produto_id)
      .where('consultor_id', req.userLogged.id);
    if (productConsult.length > 0)
      return res
        .status(404)
        .json({ error: 'Consultor com produto já cadastrado!' });

    if (valorprod < parseFloat(product[0].valormin))
      return res.status(404).json({
        error:
          'O valor do consultor não pode ser menor que o valor mínimo do produto!',
      });
    if (valorprod > parseFloat(product[0].valormax))
      return res.status(404).json({
        error:
          'O valor do consultor não pode ser maior que o valor máximo do produto!',
      });

    const valortotal = valorprod;
    let valorconsult = valorprod - parseFloat(product[0].valormin);
    if (valorconsult === 0) valorconsult = 1;

    const newData = {
      produto_id: produto_id,
      consultor_id: req.userLogged.id,
      valorconsult: valorconsult.toFixed(2),
      valortotal: valortotal.toFixed(2),
    };

    await knex('consultor_produtos').insert(newData).returning('*');
    return res
      .status(200)
      .json({ success: 'Produto do consultor cadastrado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const listMyProducts = async (req, res) => {
  try {
    const products = await knex('consultor_produtos')
      .select(['*', 'consultor_produtos.id'])
      .where('consultor_id', req.userLogged.id)
      .innerJoin('produtos', 'produtos.id', 'consultor_produtos.produto_id');

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidores!' });
  }
};

const editProductConsult = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.body.valorprod)
      return res.status(400).json({ error: 'Nenhuma alteração encontrada!' });

    let valorprod = parseFloat(req.body.valorprod);

    const productConsult = await knex('consultor_produtos')
      .where('produto_id', id)
      .where('consultor_id', req.userLogged.id);
    if (productConsult.length === 0)
      return res
        .status(404)
        .json({ error: 'Produto do consultor não encontrado!' });

    const product = await knex('produtos').where('id', id);
    if (product.length === 0)
      return res.status(404).json({ error: 'Produto não encontrado!' });

    if (valorprod < parseFloat(product[0].valormin))
      return res.status(404).json({
        error:
          'O valor do consultor não pode ser menor que o valor mínimo do produto!',
      });
    if (valorprod > parseFloat(product[0].valormax))
      return res.status(404).json({
        error:
          'O valor do consultor não pode ser maior que o valor máximo do produto!',
      });

    const valortotal = valorprod;
    let valorconsult = valorprod - parseFloat(product[0].valormin);
    if (valorconsult === 0) valorconsult = 1;

    await knex('consultor_produtos')
      .where('produto_id', id)
      .where('consultor_id', req.userLogged.id)
      .update({
        valorconsult: valorconsult.toFixed(2),
        valortotal: valortotal.toFixed(2),
      })
      .returning('*');

    return res.status(200).json({ success: 'Valor atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const deleteProductConsult = async (req, res) => {
  const { id } = req.params;

  try {
    const productDeleted = await knex('consultor_produtos')
      .del()
      .where('produto_id', id)
      .where('consultor_id', req.userLogged.id);
    if (productDeleted === 0)
      return res
        .status(404)
        .json({ error: 'Produto do consultor não encontrado!' });
    if (productDeleted.rowCount === 0)
      return res.status(400).json({
        error: 'Não foi possível excluir o Produto, tente novamente!',
      });

    return res.status(200).json({ success: 'Produto excluído com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

module.exports = {
  listConsults,
  bloqConsult,
  addProductConsult,
  listMyProducts,
  editProductConsult,
  deleteProductConsult,
};
