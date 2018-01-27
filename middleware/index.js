var Bodhi = require("../models/bodhi");
var Comment = require("../models/comment");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkBodhiOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Bodhi.findById(req.params.id, function(err, foundBodhi){
           if(err || !foundBodhi){
               req.flash("error", "bodhi not found");
               res.redirect("back");
           }  else {
               // does user own the bodhi?
            if(foundBodhi.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "you dont have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
        res.flash("you need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err || !foundComment){
               req.flash("error", "comment not found");
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "you don't have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "you need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "you need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;