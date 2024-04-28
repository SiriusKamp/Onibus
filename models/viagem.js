const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ViagemSchema = new Schema({
  numero_do_onibus: {
    type: Number,
    required: true,
  },
  origem: {
    type: String,
    required: true,
  },
  destino: {
    type: String,
    required: true,
  },
  horario_partida: {
    type: Date,
    required: true,
  },
  horario_chegada: {
    type: Date,
    required: true,
  },
  max_passageiros: {
    type: Number,
    required: true,
  },
});

mongoose.model("Viagem", ViagemSchema);
