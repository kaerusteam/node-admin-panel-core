"use strict";

var console = require("./logger.js"),
	log = require("./logger"),
	config = require("./config")
	;

module.exports = function(handler, options) {
	options = options || { };
	
	return function(req, res) {
		
		handler(req, params, function(err, result) {
			res.json({error: err, result: result});
		});
		
	}
}

