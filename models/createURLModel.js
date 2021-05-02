var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var createUrl = new Schema({
    shortcode : {
        type: String,
        unique: true
    },
    url :{
        type: String,
    },
    startDate : {
        type: Date,
    },
    lastSeenDate : {
        type: Date,
    },
    redirectCount: {
        type: Number,
    },
    },{
    collection: 'createURLShortCode'
    
});

const creationOfUrl = mongoose.model('createURL', createUrl)

module.exports = creationOfUrl;
