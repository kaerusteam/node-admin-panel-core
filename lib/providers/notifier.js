"use strict";

var console = require("../logger.js"),
	fs = require("fs"),
	fse = require("fs-extra"),
	db = require("../db.js"),
	async = require("async"),
	semver = require("semver"),
	ejs = require("ejs"),
	async = require("async")
	;

/**
 * @class
 * @classdesc Registration event and send notify to users
 */
var	Notifier = function() {
	this.tableName = "notificationTypes";
	this.db 			= db.getInstance("main");
}

/**
 * Registration event's type in table notificationTypes
 * @param	{string[]}	event		Event's type for registration event
 * @param	{callback}	callback	Handler for method response
 */
Notifier.prototype.ensureEventsType = function(eventsType, callback) {
	var self = this;
	if (!(eventsType instanceof Array) || !eventsType.length) {
		return callback({code : 400, message : "Input data must be not empty array of string"});
	}
	/*********************************************************************
	TODO: Remake code after determining roles and group of roles
	Exemplary algorithm:
	1. find event's type already contained in the database by type's name
	2. remove from eventsType type, that already contained in db
	3. insert remaining events type in db	
	Example:
	Input data : eventsType = ["test1", "test2","test3"]
	1. from base by query {type : {$in : eventsType}} got ["test1"]
	2. remove from eventsType "test1"
	3. insert to db eventsType=["test2","test3"]
	********************************************************************/
	callback("Current functionality would be available in future release");
	/*self.db.collection(self.tableName).find({"type": {"$in": eventsType}}, ["type"],function(err, types){
		if (err) {
			console.error(err);
			return callback({code : 500, message : "Error with db work", internalMessage : err});
		} 
		types.toArray(function(err, types){
			if (err) {
				console.error(err);
				return	callback({code : 500, message : "Error with db work", internalMessage : err});
			}
			for (var i = 0; i < types.length; i++) {
				var ind = eventsType.indexOf(types[i].type);
				if (ind != -1) {
					eventsType.splice(ind, 1);
				}
			}
			if (!eventsType.length){
				return callback(false);
			}
			self.db.collection(self.tableName).insert(eventsType.map(function(x){
				return {
					type : x,
					roles : [],
					users : [],
					groups : []
				}
			}), {safe : true}, function(err,insertType){
				if (err) {
					return callback({code : 500, message : "Error with db work", internalMessage : err});
				}
				callback(false);
			});
		});
	});*/
}

/**
 * Notify event
 * @param  {object|object[]}		events		Events for send
 * @param  {string}					events.type	Type event
 * @param  {callback}	callback	Handler for method response
 */
Notifier.prototype.notify = function(events, callback) {
	var self = this;
	if (!(events instanceof Array) && !(events instanceof Object)) {
		return callback({code : 400, message : "Input message must be event or event's array"});
	} else if (!(events instanceof Array) && (events instanceof Object)){
		events = [events];
	}
	if (!events.length) {
		return callback(false);
	}
	/*********************************************************************
	TODO: add code after determining roles and group of roles
	Exemplary algorithm:
	1. find all users by groups and roles, defining for every event's type in sending events
	2. by every event find methods for send to users on the basis on groups and roles for events type
	3. send every event by avaliable method
	All sending method should be determine in next catalog structure
	/providers/%methodName%/%containerForCurrentMethod%.js
	/providers/%methodName%/%currentGateToSend%.js
	Example:
	/providers/sms/smsSender.js - container
	/providers/sms/smsc.js		- gate, sending event
	/providers/sms/smspilot.js	- gate, sending event
	********************************************************************/
	callback("Current functionality would be available in future release");
	// var types = [];
	// var error = "";
	// for (var i = 0; i < events.length; i++) {
	// 	if (!events[i].type) {
	// 		error = error + " Type for event " + i + " not specified."
	// 	} else if (types.indexOf(events[i].type) == -1){
	// 		types.push(events[i].type);
	// 	}
	// }	
	// if (error.length || !type.length) {
	// 	return callback({code : 400, message : error.length ? error : "Event's type not specified"});
	// }
	// self.db.collection(self.tableName).find({"type" : {"$in" : types}}, function(err, types){
	// 	if (err) {
	// 		return callback({code : 500, message : "Error with db work", internalMessage : err});
	// 	}
	// 	types.toArray(function(err, types){
	// 		if (err || !types) {
	// 			return callback({code : 500, message : "Error with db work", internalMessage : err});
	// 		} 
	// 		var queryUsers = {};
	// 		******************************************************************************************
	// 		TODO : add convert roles, groups and users from types to queryUsers. Now query for all users
	// 		*******************************************************************************************
	// 		self.db.collection("users").find(queryUsers, function(err, users){
	// 			if (err){
	// 				return callback({code : 500, message : "Error with db work", internalMessage : err});
	// 			}
	// 			users.toArray(function(err,users){
	// 				if (err || !users){
	// 					return callback({code : 500, message : "Error with db work", internalMessage : err});
	// 				}
	// 				/*************************************************************************************************		
	// 				TODO : diff users by types used groups, roles and users from types. Now, all users add to all type
	// 				TODO : add notify method, used by event with specify type.
	// 				**************************************************************************************************/
	// 				for (var i = 0; i < types.length; i++) {
	// 					types[i].sendUsers = users;
	// 				}
	// 				async.map(events, function(event, cb){

	// 				}, function(err, result){

	// 				});
	// 			});
	// 		});
	// 	});
	// });
};

module.exports = new Notifier();