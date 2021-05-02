var createURLData = require('../models/createURLModel.js');
var moment = require("moment-timezone");
var RandExp = require('randexp'); // must require on node


module.exports.shorten = function(req, res){
    var returnData = {};
    var shortCodeValidate;
    var jsonObj = JSON.parse(JSON.stringify(req.body, null, 3));
    if(jsonObj.url == undefined || jsonObj.url == null){
        returnData["ERROR"] = 'URL not found';
        res.status(400).send(returnData);
    }
		else {
			if(jsonObj.shortcode == undefined || jsonObj.shortcode == null){
				shortCodeValidate	= new RandExp(/^[0-9a-zA-Z_]{6}$/).gen();
				createData(shortCodeValidate,jsonObj, function(response){
					if(response.err != null){
						if(response.err.code == 11000){
							returnData["ERROR"] = response.message;
							res.status(409).send(returnData);
							}
					} else {
						returnData.shortcode = response.message;
						res.status(201).send(returnData);
					}
				})
			}
			else if((/^[0-9a-zA-Z_]{4,}$/).test(jsonObj.shortcode)){
				shortCodeValidate = jsonObj.shortcode;
				createData(shortCodeValidate,jsonObj, function(response){
					if(response.err != null){
						if(response.err.code == 11000){
							returnData["ERROR"] = response.message;
							res.status(409).send(returnData);
							}
					} else {
						returnData.shortcode = response.message;
						res.status(201).send(returnData);
					}
				})
			} else {
				returnData.Error = "Shortcode fails to meet the following regexp"
				res.status(422).send(returnData)
			}
		} 

}
		
function createData(shortCodeValidate,jsonObj, callback){
	var returnData = {};
	var createDate = new createURLData ({
		shortcode : shortCodeValidate,//jsonObj.shortcode,
		url : jsonObj.url,
		startDate : moment().utc().format(),
		lastSeenDate : jsonObj.lastSeenDate,
		redirectCount: 0

});
	createDate.save(function(err){
			if(err){
				if(err.code == 11000){
					returnData.message = "shortcode " +jsonObj.shortcode + " already found!";
					callback(returnData)
				}		
			} else {
			returnData.message = shortCodeValidate;
			callback(returnData)
		}
	})
}

module.exports.getUrlData = function(req, res){
	var returnData = {};

	var searchKey = req.query;// str.includes("world");

	if(JSON.stringify(req.query).search("stats") >= 0){
		var checkKey = (req.query.shortcode).split("/");
		var searchStats = {
			shortcode : checkKey[0]
		}
		createURLData.find(searchStats,function(err, data){
			if(err){
				returnData.err = err;
				res.status(404).send(returnData);
			}else {
				if(data.length > 0){
					returnData.startDate = data[0].startDate;
					returnData.lastSeenDate = data[0].lastSeenDate
					returnData.redirectCount = data[0].redirectCount
					res.status(302).send(returnData);	
				} else {
					returnData["ERROR"] = "No data found in the System";
					res.status(404).send(returnData);
				}		
			}
		});
	} else {
	createURLData.find(searchKey,function(err, data){
		if(err){
			returnData.err = err;
			res.status(404).send(returnData);
		}
		else{

			if(data.length > 0){
		 		var location = data[0].url;
				var redirectCount = data[0].redirectCount + 1;
					var updateData = {
						redirectCount :  redirectCount,
						lastSeenDate : moment().utc().format()
					};
					createURLData.updateOne(updateData, function(err, updateRes){
						returnData.Location = location
						// returnData = 'HTTP/1.1 302 Found'
						res.status(302).send(returnData);
					})
		} else {
			returnData["ERROR"] = "No data found in the System";
			res.status(404).send(returnData);

		}
	}
	});
}

}
