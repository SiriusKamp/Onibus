const mongoose = require("mongoose");

const cadeiraSchema = new mongoose.Schema({
  numero: {
    type: Number,
    required: true,
  },
  reserva: {
    info_reserva: {
      type: String,
      default: null,
    },
  },
  numero_onibus: {
    type: Number,
    required: true,
  },
});

mongoose.model("Cadeira", cadeiraSchema);
