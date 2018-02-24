var mongoose = require("mongoose");

var bodhiSchema = new mongoose.Schema({
    name: String,
    donation: String,
    BTCaddress: String,
    // Image or string? BTCQR: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Bodhi", bodhiSchema);