"use strict";

var console = require("./logger.js"),
	config = require("./config"),
	express = require("express"),
	async = require("async"),
	db = require("./db.js"),
	modules = require("./modules.js")
	;


var Server = function() {
	process.on("uncaughtException", function(err) {
		console.error(err);
		process.exit(1);
	});
}

Server.prototype.install = function() {
	var self = this;


	async.series({
		db: db.connectAll.bind(db),
		install: function(cb) {
			require("./install.js").install(cb);
		},
		modules: modules.loadAll.bind(modules)
	}, function(err) {
		if(err) {
			console.error("installation failed");
			process.exit(1);
		}
		else {
			console.log("installation successfully completed");
			process.exit(0);
		}
	});
}

Server.prototype.listen = function() {
	var self = this;

	async.series({
		db: db.connectAll.bind(db),
		modules: modules.loadAll.bind(modules)
	}, function(err) {
		if(err) {
			console.error("failed initialization");
			return process.exit(1);
		}

		self.app = express();
		self.app.listen(config.port, function() {
			console.log("server listen on %d", config.port);
		});
	});
}


module.exports = Server;