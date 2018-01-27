
var mongoose = require("mongoose");
var Bodhi = require("./models/bodhi");
var Comment = require("./models/comment");

var data = [
    {
        name: "visions", 
        image:"http://www.zen-buddhism.net/images/zen-quotes.jpg",
        description:"he is looking but is yet to find. he should look to his own ego"
    },
    {
        name: "introspection", 
        image:"http://news.stanford.edu/pr/2012/images/meditation_release.jpg",
        description:"he may be almost there. should embrace the now more"
    },
    {
        name: "Daruma", 
        image:"http://factsanddetails.com/media/2/20090801-British%20Museum%20Daruma%2016th%20ps203559_l.jpg",
        description:"Daruma, wow this guy is a mess. where should i begin. Its a fat guy telling others how to live their lives"
    },
    {
        name: "Kodo Sawaki", 
        image:"http://www.zen-buddhism.net/images/kodo-sawaki.jpg",
        description:"Compar Daruma, the founder of Zen Buddhism to Sawaki, who seems to live it"
    }
    ];

function seedDB(){
  //remove all bodhis
  Bodhi.remove({}, function(err){
            if(err){
                console.log(err);  
            }
            console.log("removed bodhis");
            // add bodhis
            data.forEach(function(seed){
                Bodhi.create(seed, function(err, bodhi){
                    if(err){
                        console.log(err);
                    } else {
                        console.log("added a bodhi!");
                        //create a comment
                        Comment.create(
                            {
                                text: "Not too sure about these guys",
                                author: "The dude"
                            }, function(err, comment){
                                if(err){
                                    console.log(err);
                                } else {
                                    bodhi.comments.push(comment);
                                    bodhi.save(); 
                                    console.log("created new comment");
                                }
                            });
                    }
                });
          });
     }); 
}

module.exports = seedDB;