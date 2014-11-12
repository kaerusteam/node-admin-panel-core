"use strict";

var console = require("./logger");
var db = require("./db.js");


var Install = function() {
	this.db = db.getInstance("main")
};

Install.prototype.install = function() {
	console.info("installing...");
	console.info("done.");
};

module.exports = new Install();