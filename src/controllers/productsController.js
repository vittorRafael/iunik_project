const knex = require('../config/connect');

const addProduct = async (req, res) => {
  const { nome, descricao } = req.body;
  const valorvenda = parseFloat(req.body.valorvenda);
  const valormin = parseFloat(req.body.valormin);
  const valormax = parseFloat(req.body.valormax);
  const altura = parseFloat(req.body.altura) || 0;
  const peso = parseFloat(req.body.peso) || 0;
  const largura = parseFloat(req.body.largura) || 0;
  const profundidade = parseFloat(req.body.profundidade) || 0;

  if (!valorvenda || !valormax || !valormin || !nome || !descricao)
    return res.status(400).json({ error: 'Preencha todos os campos!' });

  try {
    const newProduct = {
      nome,
      descricao,
      valorvenda: valorvenda.toFixed(2),
      valormax: valormax.toFixed(2),
      valormin: valormin.toFixed(2),
      altura: altura.toFixed(2),
      peso: peso.toFixed(2),
      largura: largura.toFixed(2),
      profundidade: profundidade.toFixed(2),
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
    return res.status(500).json({ error: 'Erro no servidores!' });
  }
};

const listProductsConsult = async (req, res) => {
  try {
    const products = await knex('consultor_produtos')
      .select(['*', 'consultor_produtos.id'])
      .where('produtos.inativo', false)
      .innerJoin('produtos', 'produtos.id', 'consultor_produtos.produto_id');

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidores!' });
  }
};

const editProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await knex('produtos').where('id', id);
    if (product.length === 0)
      return res.status(404).json({ error: 'Produto não encontrado!' });

    const { nome, descricao } = req.body;
    let valorvenda = parseFloat(req.body.valorvenda);
    let valormin = parseFloat(req.body.valormin);
    let valormax = parseFloat(req.body.valormax);
    let altura = parseFloat(req.body.altura);
    let peso = parseFloat(req.body.peso);
    let largura = parseFloat(req.body.largura);
    let profundidade = parseFloat(req.body.profundidade);

    if (
      !valormin &&
      !valormax &&
      !valorvenda &&
      !nome &&
      !descricao &&
      !altura &&
      !peso &&
      !largura &&
      !profundidade
    )
      return res.status(400).json({ error: 'Nenhuma alteração encontrada!' });

    valorvenda = req.body.valorvenda
      ? parseFloat(valorvenda).toFixed(2)
      : product[0].valorvenda;
    valormin = req.body.valormin
      ? parseFloat(valormin).toFixed(2)
      : product[0].valormin;
    valormax = req.body.valormax
      ? parseFloat(valormax).toFixed(2)
      : product[0].valormax;
    altura = req.body.altura
      ? parseFloat(altura).toFixed(2)
      : product[0].altura;
    peso = req.body.peso ? parseFloat(peso).toFixed(2) : product[0].peso;
    largura = req.body.largura
      ? parseFloat(largura).toFixed(2)
      : product[0].largura;
    profundidade = req.body.profundidade
      ? parseFloat(profundidade).toFixed(2)
      : product[0].profundidade;

    const data = {
      nome: nome ?? product[0].nome,
      descricao: descricao ?? product[0].descricao,
      valorvenda,
      valormin,
      valormax,
      altura,
      peso,
      largura,
      profundidade,
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

module.exports = {
  addProduct,
  listProducts,
  editProduct,
  removeProduct,
  listProductsConsult,
};
