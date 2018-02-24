var express = require("express");
var router  = express.Router({mergeParams: true});
var Bodhi   = require("../models/bodhi");
var Comment   = require("../models/comment");
var middleware = require("../middleware");

//comments new
router.get("/new", middleware.isLoggedIn, function(req, res){
    //find bodhi by id
    console.log(req.params.id);
    Bodhi.findById(req.params.id, function(err, bodhi){
       if(err){
           console.log(err);
       } else {
          res.render("comments/new", {bodhi: bodhi}); 
       }
    });
});

//comments create
router.post("/", middleware.isLoggedIn,function(req, res){
    Bodhi.findById(req.params.id, function(err, bodhi){
        if(err){
            console.log(err);
            res.redirect("/bodhis");
        } else {
         Comment.create(req.body.comment, function(err, comment){
            if(err){
                req.flash("error", "something went wrong");
                console.log(err);
            } else {
                //add username and id to the comment
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                //save comment
                comment.save();
                bodhi.comments.push(comment);
                bodhi.save();
                console.log(comment);
                req.flash("success", "successfully added comment");
                res.redirect("/bodhis/" + bodhi._id);
            }
         });
        }
    });
});

//comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Bodhi.findById(req.params.id, function(err, foundBodhi){
        if(err || !foundBodhi){
            req.flash("error", "no bodhi found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
            res.redirect("back");
           } else {
             res.render("comments/edit", {bodhi_id: req.params.id, comment: foundComment});
           }
        });
    });
});

//comment update
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
          res.redirect("back");  
        } else {
            res.redirect("/bodhis/" + req.params.id);
        }
    });
});

//comment destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
      if(err){
          res.redirect("back");
      } else {
          req.flash("success", "comment deleted");
          res.redirect("/bodhis/" + req.params.id);
      }
   }); 
});


module.exports = router;