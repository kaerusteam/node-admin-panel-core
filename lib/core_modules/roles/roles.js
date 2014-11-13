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

Roles.prototype.getRoles = function(params, callback) {
	console.log("call get with params: %j", params);
	callback(null, {result:true});
}

Roles.prototype.setRoles = function(params, callback) {
	console.log("call set with params: %j", params);
	callback(null, {result:true});
}

module.exports = new Roles();