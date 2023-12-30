const url = require("url");
const https = require("https");
const fonts = require("../../fonts.json");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("src/models/database.db");

exports.post = function(req, res) {
  const { content, title } = req.body;

  // add to database
  db.run(
    `INSERT INTO posts values ('${content}', '${title}', '${req.session.user}')`,
    function(err) {
      if (err) {
        console.log("Error inserting post into database.");
        console.log(err);
      } else {
        console.log("Successfully inserted post into database.");
      }
    }
  );

  res.redirect("/");
};

exports.register = function(req, res) {
  const { username, password, password2 } = req.body;

  if (password != password2) {
    console.log("Passwords do not match.");
    res.render("register", {
      title: "Register",
      warning: "Passwords do not match.",
    });
    return;
  }

  db.run(
    `INSERT INTO users values ('${username}', '${password}', 'guest')`,
    function(err) {
      if (err) {
        console.log("Error inserting user into database.");
        console.log(err);
        res.render("register", {
          title: "Register",
          warning: "Username is taken.",
        });
      } else {
        console.log("Successfully inserted user into database.");
        req.session.user = username;
        req.session.role = "guest";
        res.redirect("/");
      }
    }
  );
};

exports.login = function(req, res) {
  const { username, password } = req.body;

  var authorized = false;

  db.all("SELECT userid, password, role FROM users", function(err, rows) {
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].userid == username && rows[i].password == password) {
        authorized = true;
        req.session.user = username;
        req.session.role = rows[i].role;
      }
    }
    if (authorized == false) {
      //we had an authorization header by the user:password is not valid
      res.render("login", {
        title: "Login",
        notice: "Username or password is invalid.",
      });
      console.log("No authorization found, send 401.");
    } else {
      res.redirect("/");
    }
  });
};

exports.logout = function(req, res) {
  req.session.destroy();
  res.render("login", { title: "Login", notice: "You have been logged out." });
};

exports.generate = function(req, res) {
  const { input, font } = req.body;

  let options = {
    host: "asciified.thelicato.io",
    path: encodeURI("/api/v2/ascii?text=" + input + "&font=" + font), // encoudeURI to prevent unescpaed characters
  };

  console.log("Making API request to: ", options.host + options.path);

  https
    .request(options, function(apiResponse) {
      let data = "";

      apiResponse.on("data", function(chunk) {
        data += chunk;
      });

      apiResponse.on("end", function() {
        console.log("API response: ", data);
        res.render("generate", {
          title: "Home",
          user: req.session.user,
          ascii: data,
          fonts: fonts.fonts,
        });
      });
    })
    .end();
};
