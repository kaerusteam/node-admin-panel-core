"use strict";

var console = require("./logger.js"),
	config = require("./config"),
	fs = require("fs"),
	fse = require("fs-extra"),
	path = require("path"),
	async = require("async"),
	db = require("./db.js")
	;

var	Modules = function() {
	this.modules = { };
}

Modules.prototype.getModule = function(name) {
	return this.modules[name];
}

Modules.prototype.getAll = function() {
	return this.modules;
}

Modules.prototype.addModule = function(module) {
	this.modules[module.name] = {
		instance: module.instance,
		manifest: module.manifest
	}
}

Modules.prototype.loadAll = function(callback) {
	var self = this;
	async.series({
		core: self.loadDir.bind(self, "lib/core_modules"),
		user: self.loadDir.bind(self, "lib/user_modules")
	}, callback);
}

Modules.prototype.loadDir = function(modulesPath, callback) {
	var self = this;
	fs.readdir(modulesPath, function(err, dir) {
		if(err) {
			console.error(err);
			return cb(err);
		}
		async.each(dir, function(module, cb) {
			var modulePath = path.join(modulesPath, module);
			fs.stat(modulePath, function(err, stats) {
				if(err) {
					console.error(err);
					return cb(err);
				}
				if(stats.isDirectory()) {
					self.loadModule(modulePath, function(err, module) {
						if(err) {
							return cb(err);
						}

						self.updateModule(module, callback);
					});
				}
				else {
					cb();
				}
			});
		}, callback);
	});
}

Modules.prototype.loadModule = function(modulePath, callback) {
	var self = this;
	fse.readJSON(path.join(modulePath, "manifest.json"), function(err, manifest) {
		if(err) {
			console.error(err);
			return callback(err);
		}

		try {
			var module = {
				manifest: manifest,
				instance: require("./" + path.relative(__dirname, path.join(modulePath, manifest.main)))
			}
			console.log("%s@%s successfully loaded", manifest.name, manifest.version);
			self.addModule(module);
			callback(null, module);
		}
		catch(e) {
			console.error(e);
			callback(e);
		}
	});
}

Modules.prototype.updateModule = function(module, callback) {
	var self = this;
	var _db = db.getInstance("main");

	var createEntry = function(module, cb) {
		_db.collection("modules").insert({
			"name": module.manifest.name,
			"version": module.manifest.version
		}, { safe: true }, function(err) {
			if(err) {
				console.error(err);
				return cb(err);
			}

			cb();
		});
	}

	var bumpVersion = function(module, cb) {
		_db.collection("modules").update({
			"name": module.manifest.name
		}, {
			$set: {
				"version": module.manifest.version
			}
		}, function(err) {
			if(err) {
				console.error(err);
				return cb(err);
			}

			cb();
		});
	}


	_db.collection("modules").findOne({
		"name": module.manifest.name
	}, function(err, moduleEntry) {
		if(err) {
			console.error(err);
			return callback(err);
		}

		if(!moduleEntry) {
			async.series({
				create: async.apply(createEntry, module),
				update: module.instance.__update.bind(module.instance),
				init: module.instance.__init.bind(module.instance)
			}, callback);
		}
		else if(module.manifest.version !== moduleEntry.version) {
			async.series({
				bump: async.apply(bumpVersion, module),
				update: module.instance.__update.bind(module.instance),
				init: module.instance.__init.bind(module.instance)
			}, callback);
		}
		else if(module.instance.__init) {
			module.instance.__init(callback);
		}
		else {
			callback();
		}

	});
}

module.exports = new Modules();