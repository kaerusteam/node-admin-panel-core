"use strict";

var console = require("../../logger.js"),
	db = require("../../db.js")
	;

var Modules = function() {
	this.db = db.getInstance("main");
}

Modules.prototype.__update = function(callback) {
	console.log("update modules");
	callback();
}

Modules.prototype.__init = function(callback) {
	console.log("init modules");
	callback();
}

/**
 * @api public
 */
Modules.prototype.getModules = function(params, callback) {
	this.db.collection("modules").find({ }, {
		sort: [["short_name", "desc"]],
		fields: {
			"_id": true,
			"name": true,
			"version": true
		}
	}).toArray(function(err, modules) {
		if(err) {
			console.error(err);
			callback({code: 500, message: "Error with db request"});
		} else {
			callback(null, {data: modules});
		}
	});
}

Modules.prototype.setRoles = function(params, callback) {
	console.log("call set with params: %j", params);
	callback(null, {result:true});
}

module.exports = new Modules();