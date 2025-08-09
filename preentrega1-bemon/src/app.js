import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

import passport from "./config/passport.config.js";
import { jwtAuth } from "./middlewares/jwtAuth.js";

import productRouter from "./routes/productRouter.js";
import cartRouter from "./routes/cartRouter.js";
import viewsRouter from "./routes/viewsRouter.js";
import sessionsRouter from "./routes/sessionsRouter.js";
import ticketRouter from "./routes/ticketRouter.js";

import __dirname from "./utils/constantsUtil.js";
import websocket from "./websocket.js";

import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Cargar variables de entorno
dotenv.config();

const app = express();

// Puerto y configuraciones
const PORT = process.env.PORT || 8080; // Cambiado a 8080
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));

// Configuración de sesiones
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      ttl: 3600,
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Configuración de Handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/../views");
app.set("view engine", "handlebars");

// Middlewares para body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Rutas
app.use("/api/products", productRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/", viewsRouter);

app.use("/api/carts", jwtAuth, cartRouter);
app.use("/api/tickets", jwtAuth, ticketRouter);

// Middleware para manejo de errores
app.use(notFound); // 404
app.use(errorHandler); // 500

// Iniciar el servidor
const httpServer = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Configurar WebSocket
const io = new Server(httpServer);
websocket(io);
