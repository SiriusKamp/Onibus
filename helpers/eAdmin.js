module.exports = {
  eAdmin: function (req, res, next) {
    if (req.isAuthenticated() && req.user.permitions == 1) {
      return next();
    }
    req.flash("error_msg", "Você não tem permissão para entrar nesta pagina");
    res.redirect("/");
  },
  Logado: function (req, res, next) {
    if (req.isAuthenticated() && req.user.email != null) {
      return next();
    }
    req.flash(
      "error_msg",
      "Para ter acesso a esta funcionalidade você deve estar logado"
    );
    res.redirect("/");
  },
};
