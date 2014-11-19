"use strict";

var console = require("./logger.js"),
	config = require("./config"),
	express = require("express"),
	bodyParser = require("body-parser")
	;


var Express = function() {
	this.app = express();
	this.app.use(bodyParser.json());
}

Express.prototype.getApp = function() {
	return this.app;
}

Express.prototype.listen = function(callback) {
	this.app.listen(config.port, function() {
		console.log("server listen on %d", config.port);
		callback && callback();
	});
}

Express.prototype.expressify = function(handler, options) {
	options = options || { };
	
	return function(req, res) {
		var params = req.body;
		handler(params, function(err, result) {
			res.json({error: err, result: result});
		});
		
	}
}


module.exports = new Express();