const knex = require('../config/connect');
const fs = require('fs');
const path = require('path');

//listar categorias
const listCarrossel = async (req, res) => {
  const { id } = req.params;
  try {
    if (id < 1) {
      const carrosseis = await knex('carrosseis').select('*');
      return res.status(200).json(carrosseis);
    } else {
      const carrosseis = await knex('carrosseis').select('*').where('id', id);
      if (carrosseis.length === 0)
        return res.status(404).json({ error: 'Produto não encontrado!' });
      return res.status(200).json(carrosseis[0]);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidores!' });
  }
};

const addImage = async (req, res) => {
  const carrosselId = req.params.id;
  const order = parseInt(req.body.order, 10);
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  try {
    const imageUrl = file.path;

    const carrossel = await knex('carrosseis')
      .where({ id: carrosselId })
      .first();

    if (!carrossel) {
      return res.status(404).json({ error: 'Carrossel não encontrado' });
    }

    let imagens = carrossel.imagens;
    if (typeof imagens === 'string') {
      imagens = JSON.parse(imagens);
    }

    imagens = imagens.map((img) => {
      if (img.order >= order) {
        return { ...img, order: img.order + 1 };
      }
      return img;
    });

    imagens.push({ order, url: imageUrl });

    imagens.sort((a, b) => a.order - b.order);

    await knex('carrosseis')
      .where({ id: carrosselId })
      .update({ imagens: JSON.stringify(imagens) });

    res.status(200).json({ success: 'Imagem adicionada com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const editCarrossel = async (req, res) => {
  const carrosselId = req.params.id;
  const newTitle = req.body.titulo;

  if (!newTitle) {
    return res.status(400).json({ error: 'Novo título não fornecido' });
  }

  try {
    const result = await knex('carrosseis')
      .where({ id: carrosselId })
      .update({ titulo: newTitle });

    if (result === 0) {
      return res.status(404).json({ error: 'Carrossel não encontrado' });
    }

    res.status(200).json({ success: 'Título atualizado com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const removeImage = async (req, res) => {
  const carrosselId = req.params.id;
  const order = parseInt(req.params.order, 10);

  try {
    const carrossel = await knex('carrosseis')
      .where({ id: carrosselId })
      .first();

    if (!carrossel) {
      return res.status(404).json({ error: 'Carrossel não encontrado' });
    }

    let imagens = carrossel.imagens;
    if (typeof imagens === 'string') {
      imagens = JSON.parse(imagens);
    }

    const imageIndex = imagens.findIndex((img) => img.order === order);
    if (imageIndex === -1) {
      return res
        .status(404)
        .json({ error: 'Imagem com a ordem especificada não encontrada' });
    }
    fs.unlinkSync(imagens[imageIndex].url);
    imagens.splice(imageIndex, 1);

    imagens = imagens.map((img, index) => ({
      ...img,
      order: index + 1,
    }));

    await knex('carrosseis')
      .where({ id: carrosselId })
      .update({ imagens: JSON.stringify(imagens) });

    res.status(200).json({ message: 'Imagem removida com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover imagem' });
  }
};

module.exports = {
  listCarrossel,
  addImage,
  editCarrossel,
  removeImage,
};
