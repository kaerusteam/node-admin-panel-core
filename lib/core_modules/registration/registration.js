"use strict";

var console = require("../../logger.js"),
	db = require("../../db.js"),
	uuid = require('node-uuid')
	;
/**
 * @class
 * @classdesc Module for registration user in system
 */
var Registration = function() {
	this.db 			= db.getInstance("main");
	this.schema 		= require("./manifest.json").exports.schema;
	this.validator 		= require('jsonschema').Validator;
}

/**
 * Very simple registration user in system required login and pass, in future should be remake with roles and groups
 * @param	{object}		params 			Method's param
 * @param	{string}		params.login 	User's name
 * @param	{string}		params.password User's password
 * @param	{Function} 		callback Handler for method responce
 */
Registration.prototype.register = function(params,callback) {
	console.log("Register user require login and password");
	var self = this;
	//validate json
	var v = new self.validator();
	var errors = v.validate(params, self.schema.register).errors;
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
		this.db.collection("users").find({login : params.login}).toArray(function(err, users) {
			if(err) {
				console.error(err);
				callback({code: 500, message: "Error with db request"});
			} else if (users.length){
				callback({code : 400,message : "User already exists"});
			} else {
				var uuidBuffer = new Buffer(16);
				uuid.v4(null, uuidBuffer, 0); 
				params.tokens = params.tokens || [];
				params.tokens.push(uuidBuffer.toString('hex').toUpperCase());
				self.db.collection("users").insert(params, {safe : true}, function(err,users){
					if (err) {
						console.error(err);
						callback({code : 500,message : "Error with db request"});
					} else {
						//call authorization
						callback(null, users[0]);
					}
				});	
			}
		});
	}
}

/**
 * Registration user in system required sms
 * @param  {Function} callback [description]
 */
Registration.prototype.registerSms = function(params,callback) {
	callback({message : "Current method would be available in future release"});
}

module.exports = new Registration();