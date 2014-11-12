"use strict";

var log = require("./logger"),
	config = require("./config"),
	MongoClient = require("mongodb").MongoClient,
	async = require("async")
	;

var Db = function() {
	this.instances = {

	};
}

Db.prototype.addInstance = function(name, instance){
	this.instances[name] = instance;
}

Db.prototype.getInstance = function(name){
	return this.instances[name];
}

Db.prototype.mongoConnectionString = function(params) {
	var str = "mongodb://";
	if(params.user) {
		str += params.user + ":" + params.password + "@";
	}
	str += params.host + ":" + params.port;
	str += "/" + params.name;
	return str;
}

Db.prototype.connectAllDBs = function(callback){
	async.map(config.db, function(err, db) {
		console.
		// ...
		callback();
	});
}

Db.prototype.connect = function(callback) {
	var self = this;
	MongoClient.connect(database.mongoConnectionString(config.db.connection), config.db.options, function(err, db) {
		if(err) {
			log.error(err);
		}
		self.addInstance();
		callback(err, db);
	});
}

module.exports = new Db();