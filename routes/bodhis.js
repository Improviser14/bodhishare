var express    = require("express");
var router     = express.Router();
var Bodhi      = require("../models/bodhi");
var middleware = require("../middleware");
var request    = require("request");
var Comment    = require("../models/comment");
var multer     = require('multer');

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
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'digi9mjbp', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("api_secret: " + "encrypted");
console.log(process.env.secret);
  
// Index Route
router.get("/", function(req, res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    
    //get all topics from DB
    Bodhi.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allBodhis){
        if(err){
            console.log(err);
        }
        var count = allBodhis.length;
        Bodhi.count().exec(function (err, count) {
            if (err) {
                console.log(err);
            } else {
                res.render("bodhis/index", {
                    bodhis: allBodhis,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage)
                });
            }
        });
    });
});

//create route - add new bodhis to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err,result){
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
        }
      // add cloudinary url for the image to the bodhi object under image property
      req.body.bodhi.image = result.secure_url;
      //add image's public_id to bodhi object
      req.body.bodhi.imageId = result.public_id;
      // add author to bodhi
      req.body.bodhi.author = {
        id: req.user._id,
        username: req.user.username
      };
      Bodhi.create(req.body.bodhi, function(err, bodhi){
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
   Bodhi.findById(req.params.id).populate("comments").exec(function(err, foundBodhi){
       if(err || !foundBodhi){
           console.log("error", "Bodhi Not Found");
           res.redirect("back");
       } else {
           console.log("foundBodhi");
            //render show template with this bodhi
            res.render("bodhis/show", {bodhi: foundBodhi});
        }
    });
});

// edit bodhi route
router.get("/:id/edit", middleware.checkBodhiOwnership, function(req, res){
          Bodhi.findById(req.params.id, function(err, foundBodhi){
              if(err){
                 req.flash("error", "There was a problem");
                 res.redirect("back");
             } 
              res.render("bodhis/edit", {bodhi: foundBodhi});
    });
});

// update bodhi route
router.put("/:id", upload.single('image'), function(req, res){
    Bodhi.findById(req.params.id, async function(err, bodhi){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(bodhi.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  bodhi.imageId = result.public_id;
                  bodhi.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            bodhi.name = req.body.bodhi.name;
            bodhi.description = req.body.bodhi.description;
            bodhi.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/bodhis/" + bodhi._id);
        }
    });
});

//destroy bodhi route
router.delete('/:id', function(req, res) {
  Bodhi.findById(req.params.id, async function(err, bodhi) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(bodhi.imageId);
        bodhi.remove();
        req.flash("success", "Bodhi deleted successfully!");
        res.redirect("/bodhis");
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});


module.exports = router;
