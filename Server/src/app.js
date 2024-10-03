const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const routes = require("./routes/index.routes.js");

require("./db.js");

const server = express();

server.name = "API_DECSA";

// Middleware
server.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
server.use(bodyParser.json({ limit: "50mb" }));
server.use(cookieParser());
server.use(morgan("dev"));

// CORS
server.use(cors({
  origin: '*', // Permitir todos los orígenes
  credentials: true
}));

//PARA IPS ESPECIFICAS
/* const allowedOrigins = [
    'http://192.168.1.100', 
    'http://192.168.1.101', 
    'http://localhost:3000' 
  ];
  
  server.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true,
  }));
 */

// Servir archivos estáticos de la carpeta "uploads"
server.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
server.use("/", routes);

// Error catching endware
server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;
