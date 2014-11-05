"use strict";

var log = require("./logger"),
	config = require("./config"),
	express = require("express"),
	async = require("async"),
	db = require("./db.js")
	;


var Server = function() {
	process.on("uncaughtException", function(err) {
		log.error(err);
	});
	
	this.app = express();
}

Server.prototype.init = function(callback) {
	var self = this;
	db.connect(function(err, connection) {
		if(err) {
			log.error(err);
			return callback(err);
		}
		
		var tasks = { };
		var modules = [ ];
		
		modules.forEach(function(module) {
			task["module_" + module.name] = async.apply(module.init, connection);
		});
		
		
		async.series(tasks, function(err, data) {
			if(err) {
				log.error(err);
				return callback(err);
			}
			// ...
			callback();
		});
	});
}

Server.prototype.start = function() {
	this.app.listen(config.port, function() {
		log.info("server started at %d", config.port);
	});
}

module.exports = Server;