"use strict";

var console = require("../../logger.js")
	;

var Roles = function() {

}

Roles.prototype.__update = function(callback) {
	console.log("update roles");
	callback();
}

Roles.prototype.__init = function(callback) {
	console.log("init roles");
	callback();
}

module.exports = new Roles();