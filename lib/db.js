"use strict";

var log = require("./logger"),
	config = require("./config"),
	MongoClient = require("mongodb").MongoClient
	;

var Db = function() {

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

Db.prototype.connect = function(callback) {
	MongoClient.connect(database.mongoConnectionString(config.db.connection), config.db.options, function(err, db) {
		if(err) {
			log.error(err);
		}
		callback(err, db);
	});
}

module.exports = new Db();