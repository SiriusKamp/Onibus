const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ReservaSchema = new Schema({
  pendente: {
    type: Boolean,
    required: true,
    default: true,
  },
  check_in: {
    type: Boolean,
    required: true,
    default: false,
  },
  id_cadeira: {
    type: Schema.Types.ObjectId,
    ref: "Cadeira",
    required: true,
  },
  nome: {
    type: String,
    required: true,
  },
  idade: {
    type: Number,
    required: true,
  },
  CPF: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "em analise",
  },
});

mongoose.model("Reserva", ReservaSchema);
