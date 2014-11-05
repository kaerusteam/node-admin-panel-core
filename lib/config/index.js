"use strict";

var path = require("path");

module.exports = (function() {
	if(!process.env.NODE_ENV) {
		return require("./development.js");
	}
	
	var env = path.basename(process.env.NODE_ENV);
	var config = "./" + env + ".js";
	
	try {
		return require(config);
	}
	catch(e) {
		return require("./development.js");
	}
})();