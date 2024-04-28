// models/admin.js
const mongoose = require("mongoose");
const passport = require("passport");
const Schema = mongoose.Schema;

const AdminSquema = new Schema({
  nome: {
    type: "String",
    required: true,
  },
  email: {
    type: "String",
    required: true,
  },
  senha: {
    type: "String",
    required: true,
  },
  nascimento: {
    type: Date,
    required: true,
  },
  permitions: {
    type: "Number",
    default: 0,
  },
  pontuacao: { type: "Number", default: 0 },
  datacriacao: { type: Date, default: Date.now() },
});

mongoose.model("admins", AdminSquema);
