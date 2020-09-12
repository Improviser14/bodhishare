var dotenv = require("dotenv").config(),
  express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  Bodhi = require("./models/bodhi"),
  Comment = require("./models/comment"),
  User = require("./models/user"),
  session = require("express-session"),
  moment = require("moment"),
  seedDB = require("./seeds"),
  //requiring routes
  commentRoutes = require("./routes/comments"),
  bodhiRoutes = require("./routes/bodhis"),
  indexRoutes = require("./routes/index"),
  contactRoutes = require("./routes/contact");

//ssl must be configured on the application level --here
//uncomment this block when deploying see code at the bottom of this file
if (process.env.ENVIRONMENT === "prod") {
  app.use(function(req, res, next) {
    if (req.get("X-Forwarded-Proto") !== "https") {
      res.redirect("https://" + req.get("Host") + req.url);
    } else next();
  });
}

console.log(process.env.DATABASEURL);
var url = process.env.DATABASEURL || "mongodb://localhost/bodhishare";
mongoose.connect(url);

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

app.use(flash());
//seedDB(); //uncomment this line to seed the database

app.locals.moment = require("moment");
//passport config
app.use(
  require("express-session")({
    secret: process.env.secret,
    proxy: true,
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoutes);
app.use("/bodhis", bodhiRoutes);
app.use("/bodhis/:id/comments", commentRoutes);
app.use("/contact", contactRoutes);

// app.listen(process.env.PORT, process.env.IP ,function(){
// 		console.log("The bodhishare server has started!");
// });

if (process.env.ENVIRONMENT === "prod") {
  // sets port 8080 to default or unless otherwise specified in the environment
  app.set("port", process.env.PORT || 80);
  app.listen(app.get("port"));
} else {
  app.listen(8080, "127.0.0.1");
}
