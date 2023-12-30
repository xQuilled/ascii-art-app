const http = require("http");
const path = require("path");
const express = require("express");
const hbs = require("hbs");
const session = require("express-session");

const routes = require("./src/routes/index"); // contains routes for actions (login, register, posting, etc.)
const pages = require("./src/routes/pages"); // contains routes for pages (home page, login page, etc.)

const PORT = process.env.PORT || 3000;

const app = express();

hbs.registerPartials(__dirname + "/src/views/partials");
app.set("views", path.join(__dirname, "/src/views/"));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "hbs"); // use hbs as view engine
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret" }));

// routes for pages
app.get("/", pages.index);
app.get("/post", pages.post);
app.get("/login", pages.login);
app.get("/users", pages.users);
app.get("/generate", pages.generate);
app.get("/register", pages.register);

// routes for actions
app.get("/logout", routes.logout);
app.post("/login", routes.login);
app.post("/register", routes.register);
app.post("/generate", routes.generate);
app.post("/post", routes.post);

app.listen(PORT, (err) => {
  if (err) {
    return console.log(`Unable to start the server on port ${PORT}`, err);
  }
  console.log(`Server is listening on port ${PORT}`);
});
