const knex = require('../config/connect');

const addAssessments = async (req, res) => {
  const { id } = req.params;
  const { comentario } = req.body;
  const estrelas = parseInt(req.body.estrelas);
  try {
    const product = await knex('produtos').where('id', id);
    if (product.length === 0)
      return res.status(404).json({ error: 'Produto não encontrado!' });

    if (!comentario)
      return res.status(400).json({ error: 'A Avaliação não pode ser vazia!' });

    if (estrelas < 1 || estrelas > 5)
      return res
        .status(400)
        .json({ error: 'Quantidade de estrelas inválida!' });

    const data = {
      comentario,
      estrelas,
      produto_id: id,
    };

    await knex('avaliacoes').insert(data);
    const assessments = await knex('avaliacoes')
      .select('*')
      .where('produto_id', id);
    let totstars = 0;
    assessments.forEach((assessment) => {
      totstars += assessment.estrelas;
    });
    const mediaavs = totstars / assessments.length;
    await knex('produtos')
      .update({ mediaavs: mediaavs.toFixed(2) })
      .where('id', id);

    return res
      .status(200)
      .json({ success: 'Avaliação adicionada com sucesso!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const listAssessments = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await knex('produtos').where('id', id);
    if (product.length === 0)
      return res.status(404).json({ error: 'Produto não encontrado!' });

    const assessments = await knex('avaliacoes')
      .select('*')
      .where('produto_id', id);

    return res.status(200).json(assessments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const updateAssessments = async (req, res) => {
  const { id } = req.params;
  const { comentario } = req.body;
  const estrelas = parseInt(req.body.estrelas);

  try {
    const assessment = await knex('avaliacoes').where('id', id);
    if (assessment.length === 0)
      return res.status(404).json({ error: 'Avaliação não encontrada!' });

    if (comentario.length === 0)
      return res.status(400).json({ error: 'A Avaliação não pode ser vazia!' });

    if (estrelas < 1 || estrelas > 5)
      return res
        .status(400)
        .json({ error: 'Quantidade de estrelas inválida!' });

    await knex('avaliacoes').update({ comentario, estrelas }).where('id', id);

    const assessments = await knex('avaliacoes')
      .select('*')
      .where('produto_id', assessment[0].produto_id);
    let totstars = 0;
    assessments.forEach((assessment) => {
      totstars += assessment.estrelas;
    });
    const mediaavs = totstars / assessments.length;
    await knex('produtos')
      .update({ mediaavs: mediaavs.toFixed(2) })
      .where('id', assessment[0].produto_id);
    return res
      .status(200)
      .json({ success: 'Avaliação atualizada com sucesso!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

const removeAssessment = async (req, res) => {
  const { id } = req.params;
  try {
    const assessment = await knex('avaliacoes').where('id', id);
    if (assessment.length === 0)
      return res.status(404).json({ error: 'Avaliação não encontrada!' });

    await knex('avaliacoes').del().where('id', id);

    const assessments = await knex('avaliacoes')
      .select('*')
      .where('produto_id', assessment[0].produto_id);
    let totstars = 0;
    assessments.forEach((assessment) => {
      totstars += assessment.estrelas;
    });
    const mediaavs = totstars / assessments.length;
    await knex('produtos')
      .update({ mediaavs: mediaavs.toFixed(2) })
      .where('id', assessment[0].produto_id);

    return res.status(200).json({ success: 'Avaliação excluída com sucesso!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erro no servidor!' });
  }
};

module.exports = {
  addAssessments,
  listAssessments,
  updateAssessments,
  removeAssessment,
};
