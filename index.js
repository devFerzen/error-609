import { ApolloServer } from "apollo-server-express";
import { applyMiddleware } from "graphql-middleware";
import express from "express"; //express-graphql or express
import jwt from "jsonwebtoken";
import jwt_decode from "jwt-decode";

import graphqlSchema from "./src/graphql/schema.js";
/* AFSS - Investigación pendiente
  -> Las dependencies de arriba general un warning 61608 junto con
      graphql-tools se analizará después al corto, quizás mediano plazo
      no traerá complicaciones. (express-jwt quizás es el usa este método)
*/
import cors from "cors";
import cookieParser from "cookie-parser";
import permissions from "./src/graphql/permisos.js";
import mongoose from "mongoose";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import cloudinary from "cloudinary";

import creacionToken from "./src/utilities/autorizacionToken.js";
import Models from "./src/graphql/models/index.js";
import serveStatic from "serve-static";

//Conexión MongoDb
mongoose.set("debug", false);
mongoose
  .connect(`${process.env.mongoUrl}`, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then((mongoose) => console.log("DB Conectada... (°u°)"))
  .catch((err) => console.log("DB No se Conecto... (T.T)"));

//Server and env Config
const app = express();
const port = process.env.port || 3080;

app.use(serveStatic(__dirname + "/src/dist"));

const corsOption = {
  origin: `http://localhost:${port}`,
  credentials: true, //credentials true afss: investigar más la apertura de credenciales con client
  maxAge: 3600,
};
app.use(cors());

//Http console logs
/*morgan.token("custom", "Nuevo :method request meje de :url ...(*.*) Estatus de :status " +"Con un tiempo de :total-time[2] milliseconds...");
app.use(morgan('custom'));*/

app.use(cookieParser());

//Silent Refresh
app.use(async function (req, res, next) {
  let authTokenVerify, refreshTokenVerify, UsuarioLoggeado;
  let tokenAcceso = true;

  const authToken = req.cookies["auth-token"];
  const refreshToken = req.cookies["refresh-token"];

  if (!authToken && !refreshToken) {
    return next();
  }

  //primero poner el de refreshToken si este esta expirado o tiene error borrar todo cookie
  if (!refreshToken) {
    return next(); //tampoco cuenta con token de refrescar
  }

  try {
    jwt.verify(refreshToken, "envPassSecret2", function (err, decoded) {
      if (err) {
        console.log(">>> refresh esta expirado");
        tokenAcceso = false;
        return;
      }

      refreshTokenVerify = decoded;
    });
  } catch (error) {
    console.log("error en el verify token refreshData");
    console.dir(error);
    //Este debe de eliminar todo token existente para obligar volver a inicar sesion
    return next();
  }

  if (!tokenAcceso) {
    res.clearCookie("refresh-token");
    res.clearCookie("auth-token");
    return next();
  }

  try {
    jwt.verify(authToken, "envPassSecret", async function (err, decoded) {
      if (err) {
        if (err.message === "jwt expired") {
          try {
            //usar lo contrario de verify
            authTokenVerify = jwt_decode(authToken, "envPassSecret");
            console.log(authTokenVerify);

            UsuarioLoggeado = await Models.Usuario.findById(
              authTokenVerify[`http://localhost:${port}/graphql`].id
            )
              .lean()
              .exec();
          } catch (error) {
            console.log(">>> Problemas al encontrar el usuario");
            tokenAcceso = false;
            return;
          }

          //verificar si el refresh token count es igual que su bd
          if (
            !UsuarioLoggeado ||
            UsuarioLoggeado.conteo_sesion !=
              refreshTokenVerify[`http://localhost:${port}/graphql`].conteo_sesion
          ) {
            console.log(
              "no se encontro el usuario o son diferentes los conteos de sesion"
            );
            tokenAcceso = false;
            return;
          }

          //creacion de tokens y de graphql context
          //**** analizar bien estos pasos creo que esta re-creando los tokens en cada llamada */
          const { autorizacion_token, actualizacion_token } =
            creacionToken(UsuarioLoggeado);
          console.log(">>> Nuevas Tokens");

          /*res.cookie("auth-token", autorizacion_token, {
                                sameSite: 'strict',
                                path: '/',
                                expire: new Date(new Date().getTime() + 60 * 60000),
                                httpOnly: true
                            });

                            res.cookie("refresh-token", actualizacion_token, {
                                expire: new Date(new Date().getTime() + 6 * 1000) //60 * 60000)
                            });

                            req.user = {
                              id: UsuarioLoggeado._id,
                              numero_telefonico_verificado: UsuarioLoggeado.numero_telefonico_verificado
                            };*/
        } else {
          console.log(">>> Auth verify con error");
          tokenAcceso = false;
        }
      }

      authTokenVerify = decoded;
    });
  } catch (error) {
    //no cuenta con un token de autorización4
    console.log("authTokenVerify token en error");
    return next();
  }

  //Si adentro del callback de verify auth token no pasa, este punto lo regresa.
  if (!tokenAcceso) {
    return next();
  }

  req.user = {
    id: authTokenVerify[`http://localhost:${port}/graphql`].id,
    token: authToken,
  };

  return next();
});

// Apollo Server
const apolloContext = ({ req, res }) => ({
  req,
  res,
  user: req.user || null,
  Models,
});

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("file destination", file);
    console.dir(JSON.parse(req.body.filePondImages));
    console.log("dirName...", __dirname);

    let uploadPath = path.join(__dirname, "..", "uploads");

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    console.log("file");
    console.dir(file);
    cb(null, Date.now() + "-" + file.originalname);
  },
});

let upload = multer({
  dest: "uploads/",
  storage: storage,
  fileFilter: function (req, file, cb) {
    let ext = path.extname(file.originalname);

    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
});

// Return "https" URLs by setting secure: true
cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log the configuration
console.log(cloudinary.config());

app.post(
  "/upload",
  upload.array("filePondImages", 6),
  async (req, res, next) => {
    console.log("req files: ");
    console.dir(req.files);
    console.log("req body");
    console.dir(req.body);
    /*{ 
        Object explain
        fieldname: 'filePondImages',
        originalname: 'fondo.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'C:\\Users\\aqual\\repositorioWerk\\playgroundWerk\\werkNode\\uploads\\imagenes\\anuncio',
        filename: '1619460111681-fondo.jpg',
        path: 'C:\\Users\\aqual\\repositorioWerk\\playgroundWerk\\werkNode\\uploads\\imagenes\\anuncio\\1619460111681-fondo.jpg',
        size: 5510
    }*/
    //console.log("body upload", req.body); info extra dada en metadata

    if (!req.files) {
      const error = new Error("Something went mejeWrong");
      error.httpStatusCode = 400;
      return next(error);
    }

    const answer = await cloudinary.uploader
      .upload(req.files[0].path)
      .then((result) => {
        console.log("result...");
        console.log(result);
        res.send(result.secure_url);
      })
      .catch((err) => {
        console.log("err....");
        console.dir(err);
        res.status(500).send(new Error("archivo fallidoo buajajaj"));
      });
  }
);

app.post("/delete", (req, res, next) => {
  console.log("uploading file: ", req.files);
  console.dir(req.body);

  if (!req.files) {
    const error = new Error("Something went mejeWrong");
    error.httpStatusCode = 400;
    return next(error);
  }

  res.send([req.files[0].filename]);
});

app.use("/uploads", express.static("uploads"));

app.get("/api", (req, res) => {
  res.send({
    message: "Welcome to the API.",
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/src/dist/index.html"));
});

const server = new ApolloServer({
  schema: applyMiddleware(graphqlSchema),
  graphiql: process.env.NODE_ENV === "dev" ? true : false, //http://localhost:3080/graphql
  context: apolloContext,
});
server.applyMiddleware({ app, cors: corsOption }); //overriding cors made by express https://stackoverflow.com/questions/54485239/apollo-server-express-cors-issue

app.listen(port, () => {
  console.log(`Servidor conectado => puerto: ${port}...`);
});
