"use strict";

var console = require("./logger.js"),
	config = require("./config"),
	express = require("./express.js"),
	async = require("async"),
	db = require("./db.js"),
	modules = require("./modules.js"),
	templates = require("./templates.js")

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

		express.listen();
	});
}

Server.prototype.createModule = function(name, options){
	var self = this;
	if (!options.web) {
		templates.createServerModule(name,options.core, options.database, function(err,res){
			if (err) {
				console.error(err);
				process.exit(1);
			} else {
				console.log("new module successfully created");
				process.exit(0);
			}
		});		
	} else {
		templates.createClientModule(name,options.core, options.database, function(err,res){
			if (err) {
				console.error(err);
				process.exit(1);
			} else {
				console.log("new module successfully created");
				process.exit(0);
			}
		});		
	}
}

Server.prototype.createMigration = function(name, options) {
	var self = this;
	templates.createMigration(name, options, function(err,res){
		if (err) {
			console.error(err);
			process.exit(1);
		} else {
			console.log("new migration for module " + name + " successfully created");
			process.exit(0);
		}
	});
}

module.exports = Server;