var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");

//landing page
router.get("/", function(req, res){
    res.render("landing");
});

//show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

//signup logic
router.post("/register", function(req, res){
   var newUser = new User({username: req.body.username});
   //eval(require('locus'))
   if(req.body.adminCode === process.env.ADMIN_CODE){
       newUser.isAdmin = true;
       console.log("adminCode: " + "encrypted and entered correctly");
   }
   User.register(newUser, req.body.password, function(err, user){
      if(err){
          console.log(err);
          return res.render("register", {error: err.message});
      } 
      passport.authenticate("local")(req, res, function(){
         req.flash("success", "welcome to bodhishare " + user.username);
         res.redirect("/bodhis"); 
      });
   });
});

//show login form
router.get("/login", function(req, res ){
   res.render("login"); 
});

//login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/bodhis",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: "welcome back"
    }), function(req, res){
});

//logout route 
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "logged you out");
   res.redirect("/bodhis");
});

module.exports = router;