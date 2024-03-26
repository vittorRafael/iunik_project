const knex = require('../config/connect');

const addProduct = async (req, res) => {
  const { nome, descricao } = req.body;
  const valorprod = parseFloat(req.body.valorprod);
  const valormin = parseFloat(req.body.valormin);
  const valormax = parseFloat(req.body.valormax);
  if (!valorprod || !valormax || !valormin || !nome || !descricao)
    return res.status(400).json({ error: 'Preencha todos os campos!' });

  try {
    const valorconsult = valormin;
    const valortotal = valorprod + valorconsult;

    const newProduct = {
      nome,
      descricao,
      valorprod: valorprod.toFixed(2),
      valormax: valormax.toFixed(2),
      valormin: valormin.toFixed(2),
      valorconsult: valorconsult.toFixed(2),
      valortotal: valortotal.toFixed(2),
    };

    await knex('produtos').insert(newProduct).returning('*');

    return res.status(200).json({ success: 'Produto cadastrado com sucesso!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};
const listProducts = async (req, res) => {
  const { id } = req.params;
  try {
    if (id < 1) {
      const products = await knex('produtos').select('*');
      return res.status(200).json(products);
    } else {
      const products = await knex('produtos').select('*').where('id', id);
      if (products.length === 0)
        return res.status(404).json({ error: 'Produto não encontrado!' });
      return res.status(200).json(products[0]);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};
const editProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await knex('produtos').where('id', id);
    if (product.length === 0)
      return res.status(404).json({ error: 'Produto não encontrado!' });

    const { nome, descricao } = req.body;
    let valorprod = parseFloat(req.body.valorprod);
    let valormin = parseFloat(req.body.valormin);
    let valormax = parseFloat(req.body.valormax);

    if (!valormin && !valormax && !valorprod && !nome && !descricao)
      return res.status(400).json({ error: 'Nenhuma alteração encontrada!' });

    valorprod = req.body.valorprod ? valorprod : product[0].valorprod;
    valormin = req.body.valormin ? valormin : product[0].valormin;
    valormax = req.body.valormax ? valormax : product[0].valormax;

    let valorconsult = parseFloat(product[0].valorconsult);

    if (valorconsult < parseFloat(valormin)) {
      valorconsult = parseFloat(valormin);
    }

    if (valorconsult > parseFloat(valormax)) {
      valorconsult = parseFloat(valormax);
    }

    let valortotal = parseFloat(valorprod) + valorconsult;

    const data = {
      nome: nome ?? product[0].nome,
      descricao: descricao ?? product[0].descricao,
      valorprod: req.body.valorprod
        ? parseFloat(valorprod).toFixed(2)
        : product[0].valorprod,
      valormin: req.body.valormin
        ? parseFloat(valormin).toFixed(2)
        : product[0].valormin,
      valormax: req.body.valormax
        ? parseFloat(valormax).toFixed(2)
        : product[0].valormax,
      valorconsult: valorconsult.toFixed(2),
      valortotal: valortotal.toFixed(2),
    };

    await knex('produtos').where('id', id).update(data).returning('*');

    return res.status(200).json({ success: 'Produto atualizado com sucesso!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};
const removeProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const productDeleted = await knex('produtos').del().where('id', id);
    if (productDeleted === 0)
      return res.status(404).json({ error: 'Produto não encontrado!' });
    if (productDeleted.rowCount === 0)
      return res.status(400).json({
        error: 'Não foi possível excluir o Produto, tente novamente!',
      });

    return res.status(200).json({ success: 'Produto excluído com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const editValorConsult = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.body.valorconsult)
      return res.status(400).json({ error: 'Nenhuma alteração encontrada!' });

    let valorconsult = parseFloat(req.body.valorconsult);

    const product = await knex('produtos').where('id', id);
    if (product.length === 0)
      return res.status(404).json({ error: 'Produto não encontrado!' });

    if (valorconsult > parseFloat(product[0].valormax))
      return res.status(400).json({
        error: 'O novo valor não pode ser maior que o valor máximo definido!',
      });
    if (valorconsult < parseFloat(product[0].valormin))
      return res.status(400).json({
        error: 'O novo valor não pode ser menor que o valor mínimo definido!',
      });

    let valorprod = parseFloat(product[0].valorprod);
    let valortotal = parseFloat(valorprod) + valorconsult;

    await knex('produtos')
      .where('id', id)
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

module.exports = {
  addProduct,
  listProducts,
  editProduct,
  removeProduct,
  editValorConsult,
};
