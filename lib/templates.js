"use strict";

var console = require("./logger.js"),
	// config = require("./config"),
	fs = require("fs"),
	fse = require("fs-extra"),
	// path = require("path"),
	async = require("async"),
	// db = require("./db.js"),
	semver = require("semver"),
	ejs = require("ejs")
	// express = require("./express.js"),
	// urljoin = require("url-join")
	;

var	Templates = function() {

}

/**
 * Get all files in given directory and all her subdirectory  
 * @param  {string}		dir   Path to directory
 * @param  {string[]}	files in directory
 * @return {string[]}	Files in directory
 */
Templates.prototype.getFiles = function(dir, files_){
	var self = this;
	files_ = files_ || [];
	if (typeof files_ === 'undefined') {
		files_=[]
	};
	var files = fs.readdirSync(dir);
	for(var i in files){
		if (!files.hasOwnProperty(i)) continue;
		var name = dir+'/'+files[i];
		if (fs.statSync(name).isDirectory()){
			self.getFiles(name,files_);
		} else {
			files_.push(files[i]);
		}
	}
	return files_;
}

/**
 * Create new CRUD module by template on server side
 * @param  {string}  name   Module name
 * @param  {Boolean} isCore If set, then new module is a part of system core
 * @param {callback} callback Handler for method response
 */
Templates.prototype.createServerModule = function(name, isCore, dbType,callback) {
	var self = this;
	var data = {
		basename : name.toLowerCase(), 
		moduleName : name.charAt(0).toUpperCase() + name.slice(1),
		dbType : dbType ? dbType : "mongodb"
	}

	var files = self.getFiles(__dirname, null);
	if (files.indexOf(data.basename + ".js") != -1) {
		return callback("Module with given name already exists");
	}
	var templatePath = __dirname + "/templates/server_templates/crud/";
	fs.readdir(templatePath, function(err, templates){
		if (err) {
			console.error(err);
			return callback(err);
		}
		async.each(templates, function(templateName, cb){
			fs.stat(templatePath + templateName, function(err, stats) {
				if(err) {
					console.error(err);
					fse.remove(templatePath);
					return cb(err);
				}
				if(stats.isFile()) {
					fs.readFile(templatePath + templateName, 'utf8', function (err, template) {
						if (err){
							console.log(err);
							callback("Error with template");
						}else{
							var strRender = ejs.render(template, data);
							var writePath = __dirname + "/"+(isCore ? "core_modules" : "user_modules") + "/" + data.basename + "/";
							var filename = templateName.split('.')[0] == "manifest" ? "manifest.json" : data.basename + ".js";
							fse.outputFile(writePath + filename, strRender, function(err, writeRes){
								if (err) {
									console.log(err);
									fse.remove(templatePath);
									return cb(err);
								}
								cb()
							});
						}
					});
				} else {
					cb();
				}
			});
		},callback);
	});
}

/**
 * Create new CRUD module by template on client side
 * @param  {string}  name   Module name
 * @param  {Boolean} isCore If set, then new module is a part of system core
 * @param {callback} callback Handler for method response
 */
Templates.prototype.createClientModule = function(name, isCore, callback) {
	callback("Current functionality would be available in future release");
}

/**
 * Create new migration by template for module with given name
 * @param	{string}	name		module's name
 * @param	{object}	options		method options
 * @param	{callback}	callback	Handler for method response
 */
Templates.prototype.createMigration = function(name, options, callback){
	var self = this;
	if (typeof name != "string" || !name.length){
		return callback("Module's name must be string non-zero length");
	}
	var files = self.getFiles(__dirname, null);
	if (files.indexOf(name + ".js") == -1) {
		return callback("Module with given name not exists");
	}
	var templatePath = __dirname + "/templates/server_templates/migrations/";	
	/*********************************************************************************************************************************
	TODO : add creating migration to modules/version/%lastVersion%/updates/ or modules/updates if version is not exists for given module
	WARNING: to ejs.render with template must be send data in format {pathToMigrationModule : %path to migration.js%}. 
	EXAMPLE: 
	if not version {pathToMigrationModule : "../../migration.js"} 
	if version exists : {pathToMigrationModule : "../../../../migration.js"} 
	ALGORITHM:
	1. fs.readdir(templatePath, function(err, templates)) if many tempalte or read concret file templatePath + "migration.ejs"
	1.1 if use fs.readdir then use async as createServerModule else simple work
	2. create migation name as new Date.getTime() + ".js"
	3. check if given modules correct and not have version, then write migration to %module%/updates/migrationName
	4. if given module correct and have version, then write migration to %module%/version/%lastVersion%/updates/migrationName
	***********************************************************************************************************************************/
	callback("Current functionality would be available in future release");
}

module.exports = new Templates();