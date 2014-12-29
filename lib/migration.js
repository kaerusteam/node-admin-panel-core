"use strict";

var console = require("./logger.js"),
	config = require("./config"),
	fs = require("fs"),
	fse = require("fs-extra"),
	path = require("path"),
	async = require("async"),
	db = require("./db.js"),
	semver = require("semver"),
	express = require("./express.js"),
	urljoin = require("url-join")
	;

/**
 * Module for migration functionallity
 * @class
 */
var	Migration = function() {
	this.db = db.getInstance("main");
}

/**
 * Ensure new tables(collections) into database
 * @param	{string[]}	collections	Collection's name for ensure
 * @param	{Function}	callback	Handler for method response
 */
Migration.prototype.ensureCollection = function(collections, callback) {
	if (collections instanceof Array){
		if (!collections.length) {
			return callback(false, "Collection successfuly created");
		}
		self.db.collectionNames({ namesOnly: true }, function(err, existed) {
			if(err) {
				console.error(err);
				return callback(err);
			}

			existed = existed.map(function(name) {
				return name.match(/^(.*)\.(.*)$/)[2];
			});

			async.each(collections, function(name, cb) {
				if(existed.indexOf(name) > -1) {
					cb();
				}
				else {
					self.db.createCollection(name, function(err) {
						if(err) {
							console.error(err);
							cb(err);
						}
						else {
							console.log("'%s' collection created", name);
							cb();
						}
					});
				}
			}, callback);
		});		
	} 
	return	callback("collections must be a string's array");
}

/**
 * Ensure new catalog field's or update exists
 * @param	{catalogFieldsObject[]}	catalogFields	Fields object for ensure
 * @param	{Function}	callback	Handler for method response
 */
Migration.prototype.ensureCatalogFields = function(catalogFields, callback) {
	/*********************************************
	TODO: add json schema for validate catalogFields
	*********************************************/
	if (collections instanceof Array){
		if (!collections.length) {
			return callback(false, "Collection successfuly created");
		}
		self.db.collection("catalogFields").find({}, function(err, existedCatalogs){
			if (err) {
				console.error(err);
				return callback(err);
			}
			existedCatalogs.toArray(function(err, existedCatalogs){
				if (err) {
					console.error(err);
					return callback(err);
				}
				async.each(catalogFields, function(catalogField, cb) {
					var existIndex = -1;
					for (var i = 0; i < existedCatalogs.length && existIndex == -1; i++){
						if (existedCatalogs[i].table == catalogField.table) {
							existIndex = i;
						}
					}
					if (existIndex == -1) {
						self.db.collection("catalogFields").insert(catalogField, {safe : true}, function(err, res){
							if (err){
								console.error(err);
								return cb(err);
							}
							cb();
						});
					} else {
						self.db.collection("catalogFields").update({table : catalogField.table},{$addToSet: {fields: {$each: catalogField.fields}}}, {safe : true}, function(err, res){
							if (err){
								console.error(err);
								return cb(err);
							}
							cb();
						});
					}
				}, callback);
			});
		});	
	} 
	return	callback("collections must be a string's array");
}


module.exports = new Modules();