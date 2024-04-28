const express = require("express");
require("./models/admin");

const app = express();
const path = require("path");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("./models/onibus");
require("./models/viagem");
require("./models/reserva");
require("./models/cadeira");
const admin = require("./Routes/admin");
const session = require("express-session");
const flash = require("connect-flash");
const adminuser = require("./Routes/AdminUser");
const passport = require("passport");
require("./config/auth");
const Admin = mongoose.model("admins");
const { Logado } = require("./helpers/eAdmin.js");
//configure
// sessão
app.use(
  session({
    secret: "Sirius",
    resave: true,
    saveUninitialized: true,
  })
);
//passport
app.use(passport.initialize());
app.use(passport.session());
//flash
app.use(flash());
//middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});
// Template engine
app.engine(
  "handlebars",
  handlebars.engine({
    defaultlayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");

//BodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//public
app.use(express.static(path.join(__dirname, "public")));
//mongoose
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/usuarios")
  .then(() => {
    console.log("connection established");
  })
  .catch((err) => {
    console.error("erro ao conectar : " + err);
  });

//configuração das rotas
app.use("/admin", admin);
app.use("/AdminUser", adminuser);

app.get("/", function (req, res) {
  res.render("home");
});
//ultima coisa no index
app.listen(8081, () => {
  console.log("Servidor rodando na URL http://localhost:8081");
});

//app.get("/parametros/:Nome/:Cargo", function (req, res) {
//    res.send("<h1>Ola " + req.params.Nome + "</h1>");
// })
