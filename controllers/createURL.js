var createURLData = require('../models/createURLModel.js');
var moment = require("moment-timezone");
var RandExp = require('randexp'); // must require on node


module.exports.shorten = function(req, res){
    var returnData = {};
    var shortCodeValidate;
    var jsonObj = JSON.parse(JSON.stringify(req.body, null, 3));
	// console.log("jsonObj", jsonObj)
    if(jsonObj.url == undefined || jsonObj.url == null){
        returnData["ERROR"] = 'URL not found';
        res.status(400).send(returnData);
    }
		else {
			if(jsonObj.shortcode == undefined || jsonObj.shortcode == null){
				shortCodeValidate	= new RandExp(/^[0-9a-zA-Z_]{6}$/).gen();
				createData(shortCodeValidate,jsonObj, function(response){
					console.log("err", JSON.stringify(response.err))
					if(response.err!= null){
						if(response.err.code == 11000){
							console.log("coming in first")
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
					if(response.code == 409){
							returnData["ERROR"] = response.message;
							res.status(409).send(returnData);
					} else {
						returnData.shortcode = response.message;
						res.status(201).send(returnData);
					}
				})
			} else {
				returnData['ERROR'] = "Shortcode fails to meet the following regexp"
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
		lastSeenDate : null,
		redirectCount: 0

});
	createDate.save(function(err){
			if(err){
				if(err.code == 11000){
					returnData.message = "shortcode " +jsonObj.shortcode + " already found!";
					returnData.code =  409;
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
	console.log("coming inside in get", req.params['0'])

	// var searchKey = (req.params['0']).toString();// str.includes("world");
	// var finalStr = searchKey.replace('/','');
	// console.log("finalStr",finalStr)
	// //console.log("searchKey", JSON.stringify(searchKey))
	// var findData = {
	// 	'shortcode': finalStr
	// }
	if(JSON.stringify(req.params['0']).search("/stats/") >= 0){
		console.log("in stats----------------->",req.params['0'] )
		var checkString = (req.params['0']).toString();
		var finalString = checkString.replace('/stats/', '')
		console.log("checkString", checkString)
		console.log("finalString", finalString)

		var searchStats = {
			'shortcode' : finalString
		}
		console.log("searchStats", searchStats)
		createURLData.find(searchStats,function(err, data){
			if(err){
				returnData.err = err;
				res.status(404).send(returnData);
			}else {
				if(data.length > 0){
					returnData["startDate"] = data[0].startDate;
					returnData["lastSeenDate"] = data[0].lastSeenDate
					returnData["redirectCount"] = data[0].redirectCount
					console.log("returnData", returnData)
					res.status(200).send(returnData);	
				} else {
					returnData["ERROR"] = "No data found in the System";
					res.status(404).send(returnData);
				}		
			}
		});
	} else {
		var searchKey = (req.params['0']).toString();// str.includes("world");
		var finalStr = searchKey.replace('/','');
		// console.log("finalStr",finalStr)
		//console.log("searchKey", JSON.stringify(searchKey))
		var findData = {
			'shortcode': finalStr
		}
	// createURLData.find(searchKey,function(err, data){
		createURLData.find(findData,function(err, data){
		// 	console.log("db err", JSON.stringify(err))
		console.log("data-->", JSON.stringify(data))
		if(err){
			returnData.err = err;
			res.status(404).send(returnData);
		}
		else{
			if(data.length > 0){
		 		var location = data[0].url;
				 console.log("data[0].redirectCount", data[0].redirectCount)
				var redirectCount = parseInt(data[0].redirectCount) + 1;

				console.log("redirectCount", redirectCount)
					var updateData = {
						["redirectCount"] : redirectCount,
						["lastSeenDate"]: moment().utc().format()
					};

					console.log("updateData", updateData)

					createURLData.updateOne(updateData, function(err, updateRes){
						returnData["Location"] = location
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
