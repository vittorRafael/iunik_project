const knex = require('../config/connect');

const listPositions = async (req, res) => {
  const positions = await knex('cargos');
  return res.status(200).json(positions);
};

module.exports = {
  listPositions,
};
