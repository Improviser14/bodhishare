
var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"), 
    mongoose   = require("mongoose"),
    flash      = require("connect-flash"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Bodhi      = require("./models/bodhi"),
    Comment    = require("./models/comment"),
    User       = require("./models/user"),
    seedDB     = require("./seeds");

//requiring routes
var commentRoutes = require("./routes/comments"),
    bodhiRoutes   = require("./routes/bodhis"),
    indexRoutes   = require("./routes/index"); 

mongoose.connect("mongodb://localhost/bodhishare/data");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB(); //seed the database


//passport config
app.use(require("express-session")({
    secret: "Paradise is a good girl!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/bodhis", bodhiRoutes);
app.use("/bodhis/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP ,function(){
    console.log("The bodhishare server has started!");
});

