const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { eAdmin } = require("../helpers/eAdmin");
const { format } = require("date-fns");
const ptBR = require("date-fns/locale/pt-BR");
const Admin = mongoose.model("admins");
const Onibus = mongoose.model("Onibus");
const Viagem = mongoose.model("Viagem");
const Reserva = mongoose.model("Reserva");
const Cadeira = mongoose.model("Cadeira");

router.get("/", eAdmin, function (req, res) {
  Admin.find()
    .sort({ datacriacao: "desc" })
    .then((admins) => {
      // Mapeia os admins formatando a data de criação
      const formattedAdmins = admins.map((admin) => ({
        ...admin._doc,
        nascimento: format(new Date(admin.nascimento), "dd/MM/yyyy", {
          locale: ptBR,
        }),
        datacriacao: format(new Date(admin.datacriacao), "dd/MM/yyyy", {
          locale: ptBR,
        }),
      }));

      res.render("admin/homeadm", { admins: formattedAdmins });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar os usuários");
      res.redirect("/admin/");
      console.log(err);
    });
});

router.post("/homeadm/delete", eAdmin, async function (req, res) {
  const adminId = req.body.id;
  console.log(adminId);
  try {
    // Use deleteOne em vez de remove
    const result = await Admin.deleteOne({ _id: adminId });

    if (result.deletedCount === 0) {
      req.flash("error_msg", "Este usuário não existe");
    } else {
      req.flash("success_msg", "Admin deletado com sucesso");
    }

    res.redirect("/admin/");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao excluir admin");
    res.redirect("/admin/");
  }
});

// Rota para transformar um usuário em admin
router.post("/tornar-admin", eAdmin, async (req, res) => {
  const adminId = req.body.id;
  try {
    // Encontrar o admin pelo ID e atualizar as permissões
    const admin = await Admin.findByIdAndUpdate(adminId, { permitions: 1 });

    if (!admin) {
      console.error(err);
      req.flash("error_msg", "Admin não encontrado");
      return res.redirect("/admin/");
    }

    req.flash("success_msg", "Usuário tornou-se admin com sucesso");
    res.redirect("/admin/");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Houve um erro ao tornar o usuário um admin");
    res.redirect("/admin/");
  }
});

router.post("/remover-admin", eAdmin, async (req, res) => {
  const adminId = req.body.id;

  try {
    // Encontrar o admin pelo ID e atualizar as permissões
    const admin = await Admin.findByIdAndUpdate(adminId, { permitions: 0 });

    if (!admin) {
      console.error(err);
      req.flash("error_msg", "Admin não encontrado");
      return res.redirect("/admin/");
    }

    req.flash("success_msg", "Permissões removidas com sucesso");
    res.redirect("/admin/");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Houve um erro ao remover permissões");
    res.redirect("/admin/");
  }
});

//gpt

router.get("/reservas", eAdmin, async (req, res) => {
  try {
    const reservasPendentes = await Reserva.find({ pendente: true }).populate(
      "id_cadeira"
    );
    res.render("admin/listaReservas", { reservas: reservasPendentes });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Houve um erro ao listar as reservas");
    res.redirect("/admin/");
  }
});

// Rota para aceitar ou recusar uma reserva
router.post("/reservas/:id/acao", eAdmin, async (req, res) => {
  const reservaId = req.params.id;
  const acao = req.body.acao; // 'aceitar' ou 'recusar'

  try {
    const reserva = await Reserva.findById(reservaId);

    if (!reserva) {
      req.flash("error_msg", "Reserva não encontrada");
      return res.redirect("/admin/reservas");
    }

    if (acao === "aceitar") {
      reserva.pendente = false;
      reserva.status = "Reserva aceita Check in aberto";
      await reserva.save();
      req.flash("success_msg", "Reserva aceita com sucesso");
    } else if (acao === "recusar") {
      reserva.status = "Reserva recusada, tente novamente ou entre em contato";
      await reserva.save();
      req.flash("success_msg", "Reserva recusada com sucesso");
    }

    res.redirect("/admin/reservas");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Houve um erro ao processar a ação da reserva");
    res.redirect("/admin/reservas");
  }
});

// Rota para cadastrar ônibus
router.get("/onibus/cadastrar", eAdmin, (req, res) => {
  res.render("admin/cadastrarOnibus");
});

router.post("/onibus/cadastrar", eAdmin, async (req, res) => {
  const erros = [];
  const { numero, numero_cadeiras } = req.body;

  if (numero > 9999 || numero < 1000) {
    erros.push({ texto: "O numero do onibus deve ter 4 numeros" });
  }

  if (numero_cadeiras < 1) {
    erros.push({ texto: "O onibus deve ter pelo menos 1 cadeira" });
  }

  if (erros.length > 0) {
    res.render("admin/cadastrarOnibus", { erros: erros });
  } else {
    try {
      // Verificar se o ônibus já existe
      const existingOnibus = await Onibus.findOne({ numero });

      if (existingOnibus) {
        req.flash("error_msg", "Ônibus já cadastrado com este número");
        return res.redirect("/admin/onibus/cadastrar");
      }

      // Criar o ônibus
      const onibus = new Onibus({ numero, numero_cadeiras });

      // Criar cadeiras e integrá-las ao ônibus
      for (let i = 0; i < numero_cadeiras; i++) {
        const cadeira = new Cadeira({
          numero: i + 1,
          reserva: { info_reserva: null },
          numero_onibus: numero,
        });
        await cadeira.save();
        onibus.cadeiras.push(cadeira);
      }

      await onibus.save();

      req.flash("success_msg", "Ônibus cadastrado com sucesso");
      res.redirect("/admin/");
    } catch (err) {
      console.error(err);
      req.flash("error_msg", "Houve um erro ao cadastrar o ônibus");
      res.redirect("/admin/onibus/cadastrar");
    }
  }
});

router.get("/viagens/cadastrar", eAdmin, async (req, res) => {
  try {
    const onibus = await Onibus.find().select("numero");

    res.render("admin/cadastrarViagem", { onibus });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Houve um erro ao carregar os ônibus");
    res.redirect("/admin/");
  }
});

router.post("/viagens/cadastrar", eAdmin, async (req, res) => {
  const {
    numero_do_onibus,
    origem,
    destino,
    horario_partida,
    horario_chegada,
    data_partida,
    data_chegada,
  } = req.body;
  const erros = [];
  partidaCompleta = new Date(`${data_partida} ${horario_partida}`);
  chegadaCompleta = new Date(`${data_chegada} ${horario_chegada}`);
  if (partidaCompleta < Date.now() || chegadaCompleta < Date.now()) {
    erros.push({ texto: "As datas de chegada e partida devem ser futuras" });
  }

  if (partidaCompleta > chegadaCompleta) {
    erros.push({ texto: "a chegada deve ser depois da partida" });
  }

  if (erros.length > 0) {
    try {
      const onibus = await Onibus.find().select("numero");

      res.render("admin/cadastrarViagem", { onibus, erros: erros });
    } catch (err) {
      console.error(err);
      req.flash("error_msg", "Houve um erro ao carregar os ônibus");
      res.redirect("/admin/");
    }
  } else {
    try {
      const onibus = await Onibus.findOne({ numero: numero_do_onibus });

      if (!onibus) {
        req.flash("error_msg", "Ônibus não encontrado");
        return res.redirect("/admin/viagens/cadastrar");
      }

      partidaCompleta.setHours(partidaCompleta.getHours() - 3);
      chegadaCompleta.setHours(chegadaCompleta.getHours() - 3);

      const viagem = new Viagem({
        numero_do_onibus,
        origem,
        destino,
        horario_chegada: chegadaCompleta,
        horario_partida: partidaCompleta,
        max_passageiros: onibus.numero_cadeiras,
      });

      await viagem.save();
      req.flash("success_msg", "Viagem cadastrada com sucesso");
      res.redirect("/admin/");
    } catch (err) {
      console.error(err);
      req.flash("error_msg", "Houve um erro ao cadastrar a viagem");
      res.redirect("/admin/viagens/cadastrar");
    }
  }
});

module.exports = router;
