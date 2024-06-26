const knex = require('../config/connect');
const fs = require('fs');

const addProduct = async (req, res) => {
  const { nome, descricao, categoria_id } = req.body;
  const valorvenda = parseFloat(req.body.valorvenda);
  const valormin = parseFloat(req.body.valormin);
  const valormax = parseFloat(req.body.valormax);
  const altura = parseFloat(req.body.altura) || 0;
  const peso = parseFloat(req.body.peso) || 0;
  const largura = parseFloat(req.body.largura) || 0;
  const profundidade = parseFloat(req.body.profundidade) || 0;

  if (
    !valorvenda ||
    !valormax ||
    !valormin ||
    !nome ||
    !descricao ||
    !categoria_id
  )
    return res.status(400).json({ error: 'Preencha todos os campos!' });

  try {
    const category = await knex('categorias').where('id', categoria_id);
    if (category.length === 0)
      return res.status(404).json({ error: 'Categoria não encontrada!' });

    if (valorvenda < valormin)
      return res.status(404).json({
        error:
          'O valor da venda não pode ser menor que o valor mínimo do produto!',
      });
    if (valorvenda > valormax)
      return res.status(404).json({
        error:
          'O valor da venda não pode ser maior que o valor máximo do produto!',
      });

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
      categoria_id,
    };

    const product = await knex('produtos').insert(newProduct).returning('*');
    return res.status(200).json({
      success: 'Produto cadastrado com sucesso!',
      idProduct: product[0].id,
    });
  } catch (error) {
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
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const editProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await knex('produtos').where('id', id);
    if (product.length === 0)
      return res.status(404).json({ error: 'Produto não encontrado!' });

    const { nome, descricao, categoria_id } = req.body;
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
      !profundidade &&
      !categoria_id
    )
      return res.status(400).json({ error: 'Nenhuma alteração encontrada!' });

    if (categoria_id) {
      const category = await knex('categorias').where('id', categoria_id);
      if (category.length === 0)
        return res.status(404).json({ error: 'Categoria não encontrada!' });
    }

    valorvenda = req.body.valorvenda
      ? parseFloat(valorvenda).toFixed(2)
      : parseFloat(product[0].valorvenda);
    valormin = req.body.valormin
      ? parseFloat(valormin).toFixed(2)
      : parseFloat(product[0].valormin);
    valormax = req.body.valormax
      ? parseFloat(valormax).toFixed(2)
      : parseFloat(product[0].valormax);
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

    if (valorvenda < valormin)
      return res.status(404).json({
        error:
          'O valor da venda não pode ser menor que o valor mínimo do produto!',
      });
    if (valorvenda > valormax)
      return res.status(404).json({
        error:
          'O valor da venda não pode ser maior que o valor máximo do produto!',
      });

    console.log(valorvenda);
    console.log(valormax);

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
      categoria_id: categoria_id ?? product[0].categoria_id,
    };

    await knex('produtos').where('id', id).update(data).returning('*');

    return res.status(200).json({ success: 'Produto atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};
const removeProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await knex('produtos').where('id', id);
    if (product.length === 0)
      return res.status(404).json({ error: 'Produto não encontrado!' });

    const productConsultDeleted = await knex('consultor_produtos')
      .del()
      .where('produto_id', id);

    const assessmentsDeleted = await knex('avaliacoes')
      .del()
      .where('produto_id', id);

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

const addImgProd = async (req, res) => {
  const { id } = req.params;
  const files = req.files;
  try {
    const product = await knex('produtos').where('id', id);
    if (product.length === 0)
      return res.status(404).json({ error: 'Produto não encontrado!' });

    if (files.length === 0)
      return res
        .status(400)
        .json({ error: 'Nenhuma imagem enviada, tente novamente!' });

    const imagesPath = product[0].imagens || [];
    files.forEach((file) => {
      imagesPath.push(file.path);
    });

    await knex('produtos')
      .where('id', id)
      .update({ imagens: imagesPath })
      .returning('*');
    return res.json({ success: 'Imagens adicionadas com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const removeImgProd = async (req, res) => {
  const { id } = req.params;
  const { imagens } = req.body;
  let cancela = false;
  try {
    const product = await knex('produtos').where('id', id);
    if (product.length === 0)
      return res.status(404).json({ error: 'Produto não encontrado!' });

    const imagesPath = [...product[0].imagens];
    const imagesDeleted = [];
    imagens.forEach((img) => {
      if (img > imagesPath.length - 1) cancela = true;
    });

    if (cancela)
      return res.status(404).json({ error: `Imagem não encontrada! ` });

    if (imagesPath.length > 0) {
      if (imagens.length > 0) {
        imagens.forEach((img) => {
          fs.unlinkSync(imagesPath[img]);
          imagesDeleted.push(imagesPath[img]);
        });
      } else {
        return res
          .status(400)
          .json({ error: 'Informe quais imagens para deletar!' });
      }

      const data = imagesPath.filter((image) => !imagesDeleted.includes(image));

      await knex('produtos')
        .where('id', id)
        .update({ imagens: data })
        .returning('*');

      return res.json({ success: 'Imagens excluídas com sucesso!' });
    } else {
      return res
        .status(400)
        .json({ error: 'Imagens não excluídas, produto sem fotos!' });
    }
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
  addImgProd,
  removeImgProd,
};
