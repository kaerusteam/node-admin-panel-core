"use strict";

var console = require("../logger.js"),
	MongoClient = require("mongodb").MongoClient,
	async = require("async"),
	ObjectID = require('mongodb').ObjectID
	;

/**
 * @class  
 * @classdesc Work with filters. 
 */
var Filters = function() {
	this.flags = ["ne", "lt", "lte", "gt","gte"];
	this.maxLimit = 1000;
	//add schema in future
	// this.schema = {
	// 	"type" : "object",
	// 	"properties" : {
	// 		"limit" : {
	// 			"type" : "number",
	// 			"minimum" : 0
	// 		},
	// 		"offset" : {
	// 			"type" : "number",
	// 			"minimum" :  0
	// 		},
	// 		"patternProperties" : {
	// 			"^\\w+$":{
	// 				"type" : "object",
	// 				"properties" : {
	// 					"filters" : {
	// 						"type" : "object",
	// 						"patternProperties" : {
	// 							"^\\w+$" : {
	// 								"anyOf" : [
	// 									{
	// 										"type" : "object",
	// 										"patternProperties" : {
	// 											"^(gt|gte|lt|lte|ne)$" : {
	// 												"anyOf" : [
	// 													{
	// 														"type" : "boolean"
	// 													},{
	// 														"type" : "number"
	// 													},{
	// 														"type" : "string",
	// 														"minLength" : 1
	// 													}
	// 												]
	// 											}
	// 										}
	// 									},{
	// 										"type" : "boolean"
	// 									},{
	// 										"type" : "number"
	// 									},{
	// 										"type" : "string",
	// 										"minLength" : 1
	// 									}
	// 								] 
	// 							}
	// 						}
	// 					},
	// 					"sort" : {
	// 						"type" : "object",
	// 						"patternProperties" : {
	// 							"^\\w+$" : {
	// 								"type" : "integer",
	// 								"enum" : [-1, 1]
	// 							}
	// 						}
	// 					},
	// 					"search" : {
	// 						"type" : "object",
	// 						"properties" : {
	// 							"columns" : {
	// 								"type" : "array",
	// 								"minItems" : 1,
	// 								"items" : {
	// 									"type" : "string",
	// 									"minLength" : 1
	// 								}
	// 							},
	// 							"str" : {
	// 								"type" : "string",
	// 								"minLength" : 1
	// 							}
	// 						},
	// 						"required" : ["columns", "str"]
	// 					},
	// 					"readColumns" : {
	// 						"type" : "array",
	// 						"minItems" : 1,
	// 						"items" : {
	// 							"type" : "string",
	// 							"minLength" : 1
	// 						}
	// 					}
	// 				},
	// 				"required" : ["readColumns"]
	// 			}
	// 		}
	// 	},
	// 	"required" : ["limit", "offset"]
	// };
	this.validator 		= require('jsonschema').Validator;
}


/**
 * @typedef filterInfo
 * @type {object}
 * @property {number} 									limit							number reading records in result
 * @property {number} 									offset							number skipping record's
 * @property {object=} 									%tableName%						filters and etc for given table
 * @property {object=} 									%tableName%.filters				filters for given table
 * @property  {object=} 								%tableName%.filters.%columnName%	filters for given column
 * @property  {(string|number|boolean|{key : value})} 	%tableName%.filters.%columnName%	filters for given column, where key in [eq,ne,lt,lte,gt,gte], value in [string,number,boolean]
 * @property  {object=} 								%tableName%.sort					sort by column given collection
 * @property  {(1|-1)=} 								%tableName%.sort.%columnName%		sort by column. 1 - ascending, -1 - descending
 * @property  {object=} 								%tableName%.search				search by given collection
 * @property  {Array<string>=} 							%tableName%.search.columns		columns for search
 * @property  {string} 									%tableName%.search.str			data for search
 * @property  {string} 									%tableName%.readColumns			columns, issued by the client
 */


/**
 * Convert query to specified query to database
 * @param  {string} 	dbType 		db type
 * @param  {filterInfo} query 		filters, sorting and etc for reading records
 * @param  {function} 	callback	handler for method responce
 */
Filters.prototype.convertQuery = function(dbType,query, callback){
	var self = this;
	/*var v = new self.validator();
	var errors = v.validate(query, self.schema).errors;
	if (errors.length) {
		var error = "";
		for (var i = 0; i < errors.length; i++) {			
			if (!i) {
				error += errors[i].stack;
			} else if (i != error.length -1) {
				error += "; " + errors[i].stack;
			} else	if (i == errors.length - 1) {
				error = error + "."
			}
		}
		callback({code : 400, message : "Incorrect input data", internalMessage : error});
	} else {
		switch(dbType){
			case "mongodb":
				self.convertMongoDb(query,callback);
			break;
			default :
				callback({code : 500, message : "not implemented", internalMessage : "Db type " + dbType + " not implemented"});
		}
	}*/
	if (typeof(query.limit) != "number" || query.limit > self.maxLimit) {
		return callback({code : 500, message : "Incorrect limit"});
	}
	if (query.offset && typeof(query.offset) != "number") {
		return callback({code : 500, message : "Incorrect offset"});
	}
	switch(dbType){
		case "mongodb":
			self.convertMongoDb(query,callback);
		break;
		default :
			callback({code : 500, message : "not implemented", internalMessage : "Db type " + dbType + " not implemented"});
	}
}


/**
 * Read record's list from db with filters, search and sorting. In future must be added to object wrap
 * @param  {filterInfo} query 		filters, sorting and etc for reading records
 * @param  {function} 	callback	handler for method responce
 */
Filters.prototype.convertMongoDb = function(query, callback){
	var parseType = function(x) {
		if(typeof x === "boolean") {
			return x;
		} else if (typeof(x) == "number"){
			return x;
		}
		/* if necessary
		else if(/^[a-fA-F0-9]{24}$/.test(x)) {
			return new ObjectID(x);
		} */
		else if(typeof(x) == "string" && /^[0-9]+/.test(x)){
			return parseInt(x);
		} else if (x.length > 0) {
			return new RegExp(RegExp.escape(x), 'i');
		}
	}
	RegExp.escape = function(text) {
		text = text || "";
	    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}
	var self = this;
	var queryRes = {
		limit : query.limit,
		offset : query.offset ? query.offset : 0,
		filters : [],
		sorting : {},
		columns : {}
	};
	delete query.limit;
	delete query.offset;
	if (!Object.keys(query).length) {
		callback(null, queryRes);
	} else {
		var tableCnt = Object.keys(query).length;
		for (var table in query) {
			var filter = {
				_table : table, 
				query : {$and : []},
				columns : {}
			};
			if (!query[table].readColumns || typeof(query[table].readColumns) == "string" || !query[table].readColumns.length) {
				return callback({code : 500, message : "Undefined columns to read"});
			}
			for (var i = 0; i < query[table].readColumns.length; i++) {
				filter.columns[query[table].readColumns[i]] = 1;
				if (tableCnt != 1) {
					queryRes.columns["value." + table + "_" + query[table].readColumns[i]] = 1;
				} else {
					queryRes.columns[query[table].readColumns[i]] = 1;
				}
			}
			if (query[table].sort) {
				//if sorting exists and direction of sorting correct, add sorting
				for (var column in query[table].sort) {
					if ([-1,1].indexOf(query[table].sort[column]) != -1) {
						if (tableCnt != 1) {
							queryRes.sorting["value." + table + "_" + column] = query[table].sort[column];
						} else {
							queryRes.sorting[column] = query[table].sort[column];
						}
					}
				}
			}
			if (query[table].search && query[table].search.columns && query[table].search.columns.length && typeof(query[table].search.columns) !="string" && typeof(query[table].search.str) == "string") {
				//if searching is exists and columns give and str is string, add search query
				var listOr = [];
				if (/^[0-9]+/.test(query[table].search.str)) {
					query[table].search.str = parseInt(query[table].search.str);
				} else if (query[table].search.str.length > 0) {
					query[table].search.str = new RegExp(RegExp.escape(query[table].search.str), 'i');
				}
				listOr = query[table].search.columns.map(function(x){
					var t = {};
					t[x] = query[table].search.str;
					return t;
				});
				if (listOr.length) {
					filter.query.$and = filter.query.$and || [];
					filter.query.$and.push({$or : listOr});
				}
			}
			if (query[table].filters && typeof(query[table].filters) == "object") {
				//if filters exists add filter				
				for (var column in query[table].filters) {
					var columnFilter = {};
					if (typeof(query[table].filters[column]) == "object") {
						//ne, gt,gte,lt,lte
						for (var flag in query[table].filters[column]) {
							if (self.flags.indexOf(flag) != -1) {
								columnFilter = {};
								columnFilter[column] = {};
								columnFilter[column]["$" + flag] = parseType(query[table].filters[column][flag]);
								filter.query.$and.push(columnFilter);
							}
						}
					} else {
						//equal
						columnFilter = {};
						columnFilter[column] = parseType(query[table].filters[column]);
						filter.query.$and.push(columnFilter);
					}
				}
			}
			if (!filter.query.$and.length){
				filter.query = {};
			}
			queryRes.filters.push(filter);
		}
		callback(null, queryRes);
	}
}

module.exports = new Filters();