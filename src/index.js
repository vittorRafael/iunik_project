require('dotenv').config();
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');
const port = process.env.PORT || 3000;
const routes = require('./routes/route');

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(routes);
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}!!!`);
});
