"use strict";

var console = require("../logger.js"),
	MongoClient = require("mongodb").MongoClient,
	async = require("async")
	;

/**
 * @class  
 * @classdesc Middleware to work with MongoDB. Probably, in future this is a part for ORM structure 
 */
var MongoDB = function() {
	this.db = {};
}

/**
 * @callback MongoDB~instanceCallback
 * @param {object} 			%error% 		- Error object or null
 * @param {object} 			%dbInstance% 	- Middleware object. Currently, simply connect to db, in future - object for work with mongoDB in ORM style
 */

/**
 * Get dbInstance. Currently, simply return connect to db, in future, probably, return object for work with mongoDB in ORM style
 * @param  {object}   conf     Data for connect to mongodb
 * @param  {MongoDB~instanceCallback} callback Hadler for method responce
 */
MongoDB.prototype.getInstance = function(conf, callback) {
	if (!this.db[conf.name]) {
		this.connect(conf, callback);
	} else {
		callback(null, this.db[conf.name]);
	}
}

/**
 * @callback MongoDB~connectCallback
 * @param {object} 			%error% 		- Error object or null
 * @param {object} 			%dbConnect% 	- Connect to db

/**
 * Set connect to db and call handler for connect object
 * @param  {object}   conf     Data for connect to mongodb
 * @param  {MongoDB~connectCallback} callback Hadler for method responce
 */
MongoDB.prototype.connect = function(conf, callback){
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
		self.db[conf.name] = db;

		callback(null, db);
	});	
}

/**
 * Read record's list from db with filters, search and sorting. In future must be added to object wrap
 * @param  {string} 								confName 								db name
 * @param  {object} 								query 									filters, sorting and etc for reading records
 * @param  {number=} 								query.limit								number reading records in result
 * @param  {number=} 								query.offset							number skipping record's
 * @param  {object=} 								query.%tableName%						filters and etc for given table
 * @param  {object=} 								query.%tableName%.filters				filters for given table
 * @param  {object=} 								query.%tableName%.filters.%columnName%	filters for given column
 * @param  {(string|number|boolean|{key : value})} 	query.%tableName%.filters.%columnName%	filters for given column, where key in [eq,ne,lt,lte,gt,gte], value in [string,number,boolean]
 * @param  {object=} 								query.%tableName%.sort					sort by column given collection
 * @param  {(1|-1)=} 								query.%tableName%.sort.%columnName%		sort by column. 1 - ascending, -1 - descending
 * @param  {object=} 								query.%tableName%.search				search by given collection
 * @param  {Array<string>=} 						query.%tableName%.search.columns		columns for search
 * @param  {string} 								query.%tableName%.search.str			data for search
 * @param  {string} 								query.%tableName%.readColumns			columns, issued by the client
 * @param  {function} 								callback								Handler for method responce
 */
MongoDB.prototype.convertQuery = function(query, callback){
	if (typeof(query.limit) != "number") {
		return callback({code : 500, message : "Incorrect limit"});
	}
	if (typeof(query.offset) != "number") {
		return callback({code : 500, message : "Incorrect offset"});
	}
	var queryRes = {
		limit : query.limit,
		offset : query.offset,
		filters : []
	};
	delete query.limit;
	delete query.offset;
	if (!Object.keys(query).length) {
		callback(null, queryRes);
	} else {
		for (var key in query) {

		}
	}
}

module.exports = new MongoDB();