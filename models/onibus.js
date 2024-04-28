const mongoose = require("mongoose");

const onibusSchema = new mongoose.Schema({
  numero: {
    type: Number,
    required: true,
    unique: true,
  },
  numero_cadeiras: {
    type: Number,
    required: true,
  },
  cadeiras: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cadeira",
    },
  ],
});

mongoose.model("Onibus", onibusSchema);
