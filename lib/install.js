"use strict";

var console = require("./logger.js"),
	db = require("./db.js").getInstance("main"),
	async = require("async")
	;


var Install = function() {

}

Install.prototype.install = function(callback) {
	var self = this;
	async.series({
		ensureCollections: self.ensureCollections.bind(self)
	}, callback);
}


Install.prototype.ensureCollections = function(callback) {
	var required = [
		"modules"
	];

	db.collectionNames({ namesOnly: true }, function(err, existed) {
		if(err) {
			console.error(err);
			return callback(err);
		}

		existed = existed.map(function(name) {
			return name.match(/^(.*)\.(.*)$/)[2];
		});

		async.each(required, function(name, cb) {
			if(existed.indexOf(name) > -1) {
				cb();
			}
			else {
				db.createCollection(name, function(err) {
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


module.exports = new Install();