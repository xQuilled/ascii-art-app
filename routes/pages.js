const url = require("url");
const https = require("https");
const fonts = require("../fonts.json");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("data/database.db");

exports.index = function (req, res) {
  if (req.session.user) {
    let page = req.query.page;
    let nextPage;
    let previousPage;
    if (page == undefined) {
      page = 1;
    } else {
      page = parseInt(page);
    }

    // get total number of posts
    db.all("SELECT COUNT(*) AS count FROM posts", function (err, count) {
      // only display next and prev page buttons if there are valid number of posts
      if (page * 10 >= count[0].count) {
        nextPage = null;
      } else {
        nextPage = page + 1;
      }
      if (page == 1) {
        previousPage = null;
      } else {
        previousPage = page - 1;
      }
    });

    let offset = (page - 1) * 10;

    db.all(
      `SELECT * FROM posts LIMIT 10 OFFSET ${offset}`,
      function (err, rows) {
        res.render("index", {
          title: "Home",
          user: req.session.user,
          posts: rows,
          nextPage: nextPage,
          previousPage: previousPage,
        });
      }
    );
  } else {
    // if user is not logged in
    res.redirect("/login");
  }
};

exports.login = function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("login", { title: "Login" });
  }
};

exports.register = function (req, res) {
  if (req.session.user) {
    // logs out user if logged in
    routes.logout(req, res);
    return;
  }
  res.render("register", { title: "Register" });
};

exports.generate = function (req, res) {
  res.render("generate", {
    title: "Generate",
    user: req.session.user,
    fonts: fonts.fonts,
  });
};

exports.post = function (req, res) {
  if (req.session.user) {
    res.render("post", { title: "Post", user: req.session.user });
  } else {
    res.redirect("/login");
  }
};

exports.profile = function (req, res) {
  if (req.session.user) {
    res.render("profile", { title: "Profile", user: req.session.user });
  } else {
    res.redirect("/login");
  }
};

exports.users = function (req, res) {
  if (req.session.role == "admin") {
    db.all("SELECT userid, password, role FROM users", function (err, rows) {
      res.render("users", { title: "Users", users: rows });
    });
  } else {
    res.redirect("/");
  }
};
