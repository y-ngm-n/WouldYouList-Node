// import modules
const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");

// import files
const indexRouter = require("./routes/index");

// configs
dotenv.config();

// create app
const app = express();

// app settings
app.set("port", process.env.PORT);

// middlewares
app.use(morgan(process.env.ENV));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false
  }
}));

// routers
app.use("/", indexRouter);

// error handling routers
app.use((req, res) => {
  res.status(404).json({ code: 404, msg: `no ${req.method}${req.url} router` });
});

app.use((err, req, res, next) => {
  res.status(500).json({ code: 500, msg: "server error", error: err });
});

// run app
app.listen(app.get("port"), (req, res) => {
  console.log(`Server Running at PORT ${app.get("port")}...`);
});