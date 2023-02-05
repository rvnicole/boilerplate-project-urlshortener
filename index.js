require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Importar Mongoose
const mongoose = require('mongoose');

// Variable de entorno con la URI de conexión 
const mySecret = process.env['BD-URI']

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// Conexión a la Base de Datos
mongoose.connect(mySecret, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Esquema
const esquemaUrls = new mongoose.Schema({
  original_url : {
    type : String,
    required : true,
    unique : true
  },
  short_url : {
    type : Number,
    required : true,
    unique : true
  }
}); 