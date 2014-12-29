"use strict";

var console = require("./logger.js"),
	config = require("./config"),
	mongo = require("./db_modules/mongodb.js"),
	async = require("async")
	;

/**
 * @class
 * @classdesc Wrapper for dbInstances. Create connect to all base in config
 */
var Db = function() {
	this.instances = { };
}

/**
 * Add db instance to list
 * @param {string} name		db name
 * @param {object} instance	object for db. Currently, simply connect to db, in future, probably, object for work with db in ORM style
 */
Db.prototype.addInstance = function(name, instance) {
	this.instances[name] = instance;
}

/**
 * Get instance for required db
 * @param	{string} name		db name
 * @returns	{object}			object for db. Currently, simply connect to db, in future, probably, object for work with db in ORM style
 */
Db.prototype.getInstance = function(name) {
	return this.instances[name];
}

/**
 * @callback Db~connectAllCallback
 * @param {object} 	%error% - Error object or null
 */ 

/**
 * Create connect for all db, described in config
 * @param  {Db~connectAllCallback} callback Handler for method responce
 */
Db.prototype.connectAll = function(callback) {
	var self = this;
	async.each(config.db, function(conf, cb) {
		switch(conf.type) {
			case "mongodb":
				mongo.getInstance(conf,function(err,db){
					if (err) {
						cb(err);
					} else {
						db.type = conf.type;
						self.addInstance(conf.name, db);
						cb();
					}
				});
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

module.exports = new Db();
