var express = require("express");
var router  = express.Router();
var Bodhi   = require("../models/bodhi");
var middleware = require("../middleware");

//index route 
router.get("/", function(req, res){
    //get all bodhis from db
    Bodhi.find({}, function(err, allBodhis){
        if(err){
            console.log(err);
        } else {
            res.render("bodhis/index", {bodhis:allBodhis});
        }
    });
});

//create route - add new bodhis to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  var name = req.body.name;
  var donation = req.body.donation;
  var BTCaddress = req.body.BTCaddress;
  var BTCQR = req.body.BTCQR;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  };
  var newBodhi = {name: name, donation: donation, image: image, description: desc, author:author};
 //create a new bodhi and save to DB
 Bodhi.create(newBodhi, function(err, newlyCreated){
     if(err){
         console.log(err);
     } else {
         //redirect back to bodhis page
         console.log(newlyCreated);
         res.redirect("/bodhis");
     }
   });
});

//new - show form to create new bodhi
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("bodhis/new"); 
});

//show - shows more info about one bodhi
router.get("/:id", function(req, res){
    //find the bodhi with provides ID
    Bodhi.findById(req.params.id).populate("comments").exec(function(err, foundBodhi){
        if(err || !foundBodhi){
            req.flash("error", "bodhi not found");
            res.redirect("back");
        } else {
            console.log(foundBodhi);
            //render show template with this bodhi
            res.render("bodhis/show", {bodhi: foundBodhi});
        }
    });
});

// edit bodhi route
router.get("/:id/edit", middleware.checkBodhiOwnership, function(req, res){
          Bodhi.findById(req.params.id, function(err, foundBodhi){
              
              res.render("bodhis/edit", {bodhi: foundBodhi});
          });
});

// update bodhi route
router.put("/:id", middleware.checkBodhiOwnership, function(req, res){
    //find and update the correct bodhi
    Bodhi.findByIdAndUpdate(req.params.id, req.body.bodhi, function(err, updatedBodhi){
       if(err){
           res.redirect("/bodhis");
       } else {
           //redirect(show page)
           res.redirect("/bodhis/" + req.params.id);
       }
    });
});

//destroy bodhi route
router.delete("/:id", middleware.checkBodhiOwnership, function(req, res){
   Bodhi.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/bodhis");
      } else {
         res.redirect("/bodhis"); 
      }
   });
});

module.exports = router;