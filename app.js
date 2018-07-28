var dotenv     = require('dotenv').config(),
		express    = require("express"),
		app        = express(),
		bodyParser = require("body-parser"), 
		mongoose   = require("mongoose"),
		flash      = require("connect-flash"),
		passport   = require("passport"),
		cookieParser = require("cookie-parser"),
		LocalStrategy = require("passport-local"),
		methodOverride = require("method-override"),
		Bodhi      = require("./models/bodhi"),
		Comment    = require("./models/comment"),
		User       = require("./models/user"),
		session = require("express-session"),
		moment = require('moment'),
		seedDB     = require("./seeds"),
		
		
//requiring routes
		commentRoutes = require("./routes/comments"),
		bodhiRoutes   = require("./routes/bodhis"),
		indexRoutes   = require("./routes/index"),
		contactRoutes = require("./routes/contact");

mongoose.connect("mongodb://localhost/bodhishare");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB(); //uncomment this line to seed the database

app.locals.moment = require("moment");
//passport config
//refactor - app.use secret to a .env file
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
app.use("/contact", contactRoutes);



app.listen(process.env.PORT, process.env.IP ,function(){
		console.log("The bodhishare server has started!");
});

