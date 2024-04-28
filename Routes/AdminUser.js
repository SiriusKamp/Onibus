// routes/admin.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

require("../models/admin");
const Admin = mongoose.model("admins");
const passport = require("passport");

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

module.exports = router;
