const knex = require('../config/connect');

const addProduct = async (req, res) => {
  const { nome, descricao } = req.body;
  const valormin = parseFloat(req.body.valormin);
  const valorconsult = parseFloat(req.body.valorconsult);
  if (!valormin || !valorconsult || !nome || !descricao)
    return res.status(400).json({ error: 'Preencha todos os campos!' });

  try {
    const valortotal = valormin + valorconsult;

    const newProduct = {
      nome,
      descricao,
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
    const { nome, descricao } = req.body;
    let valormin = req.body.valormin;
    let valorconsult = req.body.valorconsult;
    if (!valormin && !valorconsult && !nome && !descricao)
      return res.status(400).json({ error: 'Nenhuma alteração encontrada!' });

    let valortotal = product[0].valortotal;
    if (valormin) {
      valortotal = valorconsult
        ? parseFloat(valormin) + parseFloat(valorconsult)
        : parseFloat(valormin) + parseFloat(product[0].valorconsult);
    }
    console.log(valortotal);
    valormin = valormin ?? product[0].valormin;
    valorconsult = valorconsult ?? product[0].valorconsult;

    const data = {
      nome: nome ?? product[0].nome,
      descricao: descricao ?? product[0].descricao,
      valormin: req.body.valormin
        ? parseFloat(valormin).toFixed(2)
        : product[0].valormin,
      valorconsult: req.body.valorconsult
        ? parseFloat(valorconsult).toFixed(2)
        : product[0].valorconsult,
      valortotal: req.body.valormin ? valortotal.toFixed(2) : valortotal,
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
  addProduct,
  listProducts,
  editProduct,
  removeProduct,
};
