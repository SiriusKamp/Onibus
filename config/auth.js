const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("../models/admin");
const Admin = mongoose.model("admins");
const passport = require("passport");

passport.use(
  new localStrategy(
    { usernameField: "email", passwordField: "senha" },
    async (email, senha, done) => {
      try {
        const user = await Admin.findOne({ email: email });

        if (!user) {
          return done(null, false, { message: "Esta conta não existe" });
        }

        const isMatch = await bcrypt.compare(senha, user.senha);

        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Senha incorreta" });
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Admin.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

module.exports = passport;
