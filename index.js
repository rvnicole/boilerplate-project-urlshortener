require('dotenv').config();
const urlparser = require( 'urlparser' );
const dns = require( 'node:dns' );
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

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
  original_url: {
    type: String,
    required: true,
    unique: true
  },
  short_url: {
    type: Number,
    required: true,
    unique: true
  }
});

// Modelo
const ModeloUrls = mongoose.model('urls', esquemaUrls);

// Metodo POST
app.post("/api/shorturl", async (req, res) => {
  const url = req.body.url;
  const urlParse = urlparser.parse(url).host.hostname;
  
  dns.lookup( urlParse , ( error, ip ) => {
    if( error ){
      res.json( { error : 'invalid url' } );
      return;
    }
  });
  
  if( !/^https:\/\/(www\.)?\w+(\.\w+)?/.test( url ) ){
    res.json( { error : 'invalid url' } );
    return;
  };

  const documento = {
    original_url: url,
    short_url: await shortUrl()
  };

  ModeloUrls.create( [ documento ]).catch( error => {
    console.error( error );
    return;
  });

  res.json( documento );
});

async function shortUrl() {
  return await ModeloUrls.count() + 1;
};

app.get( "/api/shorturl/:param", ( req, res ) => {
  const { param } = req.params;

  const promesa = ModeloUrls.findOne( { short_url : param } );

  promesa.then( ( resultado ) => {
    const url = resultado['original_url'];
    res.redirect( url );
  });

  promesa.catch( ( error ) => {
    console.error( error );
  });
});
