require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const port = process.env.PORT || 3000;
const routes = require('./routes/route');

app.use(express.json());
// Middleware para parsing do corpo da requisição
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/uploads/:folder/:imageName', (req, res) => {
  const { folder, imageName } = req.params;
  const filePath = path.join(__dirname, '..', 'uploads', folder, imageName);

  // Verifique se o arquivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    // Envie o arquivo como resposta
    res.sendFile(filePath);
  });
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(routes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}!!!`);
});
