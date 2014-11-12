"use strict";

var console = require("./logger.js"),
	config = require("./config"),
	MongoClient = require("mongodb").MongoClient,
	async = require("async")
	;

var Db = function() {
	this.instances = { };
}

Db.prototype.addInstance = function(name, instance) {
	this.instances[name] = instance;
}

Db.prototype.getInstance = function(name) {
	return this.instances[name];
}

Db.prototype.connectAll = function(callback) {
	var self = this;
	async.each(config.db, function(conf, cb) {
		switch(conf.type) {
			case "mongodb":
				self.connectMongo(conf, cb);
				break;

			default:
				cb("not implemented");
		}
	}, function(err) {
		if(err) {
			return callback(err);
		}
		console.log("successfully connected to all DBs");
		callback();
	});
}

Db.prototype.connectMongo = function(conf, callback) {
	var self = this;
	
	var mongoConnectionString = function(params) {
		var str = "mongodb://";
		if(params.user) {
			str += params.user + ":" + params.password + "@";
		}
		str += params.host + ":" + params.port;
		str += "/" + params.name;
		return str;
	}

	MongoClient.connect(mongoConnectionString(conf.connection), conf.options, function(err, db) {
		if(err) {
			console.error(err);
			return callback(err);
		}

		console.log("connected to database: %s@%s - %s", conf.name, conf.type, db.serverConfig.name);
		self.addInstance(conf.name, db);
		callback();
	});
}

module.exports = new Db();