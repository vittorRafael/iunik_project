const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transport.use(
  'compile',
  hbs({
    viewEngine: {
      extname: '.html',
      layoutsDir: 'src/resources/mail/',
      defaultLayout: 'forgotPass',
      partialsDir: 'src/resources/mail/',
    },
    viewPath: 'src/resources/mail/',
    extName: '.html',
  }),
);

module.exports = transport;
