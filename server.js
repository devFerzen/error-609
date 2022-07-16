const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path');
const anuncios = require('./db/anuncios.json')
const serveStatic = require("serve-static");

const app = express()
const _port = process.env.PORT || 80;

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(serveStatic(__dirname + "/dist"));

app.use(cors());

app.get('/api', (req, res) => {
  res.send({
    message: 'Welcome to the API.'
  })
})

app.get('/api/dashboard', (req, res) => {
  res.json({
    result: anuncios
  })
})

app.get('/api/uploads/:Image', (req, res) => {
  const imagePath = path.join(__dirname,`/uploads/${req.params.Image}`);
  res.sendFile(imagePath);
})

app.get('/api/ddlGeneral', (req, res) => {
    const dbddlGeneral = fs.readFileSync('./db/ddls.json');
    const ddlArray = JSON.parse(dbddlGeneral);

    let _categorias = req.query.categorias;
    let _newArrayDdl = [];

    for (let loopDdls = 0; loopDdls < ddlArray.length; loopDdls++) {
      const _ddl = ddlArray[loopDdls];
      for (let _loopCategoria = 0; _loopCategoria < _categorias.length; _loopCategoria++) {
         if(_categorias[_loopCategoria] == _ddl.categoria){
          _newArrayDdl.push(ddlArray[loopDdls]);
        }
      }
    }

    res.json(_newArrayDdl);

    /* No se porque no funciono poniendolo asi
      return ddlArray.find(function(ddl, index){
      for (let _loopCategorias = 0; _loopCategorias < _categorias.length; _loopCategorias++) {
        if(_categorias[_loopCategorias] == ddl.categoria){
          console.dir(ddl);
          return ddl;
        }
      }
    });*/
})

app.get('/api/ver', (req, res) => {
    const anucioDB = fs.readFileSync('./db/anuncios.json');
    const anuncios = JSON.parse(anucioDB).anuncios;
    let verId = req.query.ids;
    let _anuncioVer;

    for (let loopAnuncios = 0; loopAnuncios < anuncios.length; loopAnuncios++) {
      if(anuncios[loopAnuncios].id == verId[0]){
        _anuncioVer = anuncios[loopAnuncios];
        break;
      }      
    }
    res.json([_anuncioVer]);
})

app.post('/api/register', (req, res) => {

  if (req.body) {
    const usuario = {
      usuario: req.body.usuario,
      contrasena: req.body.contrasena,
      numero_telefonico: req.body.numero_telefonico,
      estatus: true
    }

    console.log("register b-end");
    console.dir(usuario);


    const data = JSON.stringify(usuario, null, 2)
    let users = require('./db/usuario.json');
    users.push(usuario);

    fs.writeFileSync('./db/usuario.json', JSON.stringify(users,null,2));
    const token = jwt.sign({ usuario }, 'the_secret_key')

    res.json({pagina: 'dashboard', componenteInterno: { activationAlert: { type: "success", message: 'Bienvenido!' }, setSesion: usuario, panelHerramientasBusqueda: true } })
  } else {
    res.sendStatus(400)
  }
})

app.post('/api/loggear', (req, res) => {
  const userDB = fs.readFileSync('./db/usuario.json')
  const users = JSON.parse(userDB)

  console.dir(req.body);

  for (let loopUser = 0; loopUser < users.length; loopUser++) {
    const UserElement = users[loopUser];
    if (
      req.body &&
      req.body.usuario === UserElement.usuario &&
      req.body.contrasena === UserElement.contrasena
    ) {
      const token = jwt.sign(UserElement, 'the_secret_key')
      // In a production app, you'll want the secret key to be an environment variable
      res.json({
        token,
        usuario: UserElement
      });
      return;
    }
  }
  
  res.status(400).send({
    componenteInterno: {'activationAlert':{ type: 'error', message: 'Usuario no encontrado' }}
  });
})

app.get('/api/busqueda', (req, res) => {
  const anucioDB = fs.readFileSync('./db/anuncios.json');
  const anuncios = JSON.parse(anucioDB);
  res.json(anuncios);
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/dist/index.html"));
});

app.listen(_port, () => {
  console.log(`Server started on port ${_port}`);
});
