var express = require("express");
var router  = express.Router();
var Bodhi   = require("../models/bodhi");
var middleware = require("../middleware");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'digi9mjbp', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("api_key: " + process.env.CLOUDINARY_API_KEY);
console.log("api_secret: " + "encrypted");
  
//index route 
router.get("/", function(req, res){
    //get all bodhis from db
    Bodhi.find({}).sort({"_id": -1}).limit(10).exec(function(err, allBodhis){
        if(err){
            console.log(err);
        } else {
            res.render("bodhis/index", {bodhis:allBodhis});
        }
    });
});

//create route - add new bodhis to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function (result) {
      console.log(result);
    // add cloudinary url for the image to the campground object under image property
    req.body.bodhi.image = result.secure_url;
    console.log(req.body.bodhi);
    // add author to campground
    req.body.bodhi.author = {
      id: req.user._id,
      username: req.user.username
    };
    Bodhi.create(req.body.bodhi, function (err, bodhi) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      res.redirect('/bodhis/' + bodhi.id);
    });
  });
});


//new - show form to create new bodhi
router.get("/new", middleware.isLoggedIn, function(req, res){
    console.log(process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);
   res.render("bodhis/new"); 
});

//show - shows more info about one bodhi
router.get("/:id", function(req, res){
    //find the bodhi with provided ID and sort comments, last comment shows first
    Bodhi.findById(req.params.id).populate({
    path: "comments",
    options: {sort: {"_id": -1}}
    }).exec(function(err, foundBodhi){
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
             if(err){
                 console.log(err);
             } 
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