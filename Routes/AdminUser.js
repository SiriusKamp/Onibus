// routes/admin.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

require("../models/admin");
const Admin = mongoose.model("admins");
const passport = require("passport");
const Viagem = mongoose.model("Viagem");
const Cadeira = mongoose.model("Cadeira");
const Onibus = mongoose.model("Onibus");
const Reserva = mongoose.model("Reserva");

router.get("/registro", async (req, res) => {
  res.render("../views/registro");
});
router.post("/registro", async (req, res) => {
  try {
    const erros = [];
    const anonasc = new Date(req.body.nascimento);
    const anoNascimento = anonasc.getFullYear();
    const anoAtual = new Date().getFullYear();

    if (anoNascimento > anoAtual || anoNascimento < anoAtual - 100) {
      erros.push({ texto: "Coloque uma data de nascimento válida" });
    }

    if (!req.body.nome || !req.body.email || !req.body.senha) {
      erros.push({ texto: "Nome, e-mail e senha são obrigatórios" });
    }

    if (req.body.senha.length < 4) {
      erros.push({ texto: "A senha deve ter pelo menos 4 caracteres" });
    }

    if (erros.length > 0) {
      res.render("../views/registro", { erros: erros });
    } else {
      // Verifique se o e-mail já está registrado
      const existingAdmin = await Admin.findOne({ email: req.body.email });

      if (existingAdmin) {
        req.flash("error_msg", "Já existe uma conta com este e-mail");
        return res.redirect("/");
      }

      // Criptografar a senha
      const senhaCriptografada = await bcrypt.hash(req.body.senha, 10);

      // Crie um novo admin
      const novoAdmin = new Admin({
        nome: req.body.nome,
        email: req.body.email,
        senha: senhaCriptografada,
        nascimento: req.body.nascimento,
      });

      novoAdmin.nascimento.setHours(novoAdmin.nascimento.getHours() + 3);
      // Salve o novoAdmin no banco de dados
      await novoAdmin.save();

      req.flash("success_msg", "Usuário registrado com sucesso.");
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Houve um erro ao registrar o usuário");
    res.redirect("/");
  }
});

router.get("/login", (req, res) => {
  res.render("../views/admin/login");
});
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/adminuser/login",
    failureFlash: true,
  })(req, res, next);
});
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error(err);
      return res.redirect("/");
    }
    req.flash("success_msg", "Deslogado");
    res.redirect("/");
  });
});

// Rota para listar viagens
router.get("/viagens", async (req, res) => {
  try {
    const viagens = await Viagem.find();
    res.render("viagens", { viagens });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao listar viagens");
    res.redirect("/");
  }
});

router.get("/viagens/:id/cadeiras", async (req, res) => {
  try {
    const viagemId = req.params.id;
    const viagem = await Viagem.findById(viagemId);

    if (!viagem) {
      req.flash("error_msg", "Viagem não encontrada");
      return res.redirect("/adminuser/viagens");
    }

    const onibus = await Onibus.findOne({ numero: viagem.numero_do_onibus });
    if (!onibus) {
      req.flash("error_msg", "Ônibus não encontrado");
      return res.redirect("/adminuser/viagens");
    }

    const cadeiras = await Cadeira.find({
      numero_onibus: onibus.numero,
      "reserva.info_reserva": null,
    });

    res.render("cadeiras", {
      viagem,
      cadeiras,
    });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Houve um erro ao listar as cadeiras");
    res.redirect("/adminuser/viagens");
  }
});

// Rota para criar reserva
router.post("/reservar", async (req, res) => {
  const { viagemId, cadeiraId, nome, idade, CPF, email } = req.body;

  try {
    const cadeira = await Cadeira.findById(cadeiraId);

    if (!cadeira) {
      req.flash("error_msg", "Cadeira não encontrada");
      return res.redirect(`/adminuser/viagens/${viagemId}/cadeiras`);
    }

    if (cadeira.reserva.info_reserva) {
      req.flash("error_msg", "Cadeira já reservada");
      return res.redirect(`/adminuser/viagens/${viagemId}/cadeiras`);
    }

    const reserva = new Reserva({
      id_cadeira: cadeira._id,
      nome,
      idade,
      CPF,
      email,
    });

    await reserva.save();
    cadeira.reserva.info_reserva = reserva._id;
    await cadeira.save();

    req.flash("success_msg", "Reserva realizada com sucesso");
    res.redirect("/adminuser/viagens");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Houve um erro ao realizar a reserva");
    res.redirect(`/adminuser/viagens/${viagemId}/cadeiras`);
  }
});

module.exports = router;
