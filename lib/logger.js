"use strict";

var bunyan = require("bunyan"),
	config = require("./config"),
	path = require("path")
	;

module.exports = bunyan.createLogger({
	name: "out",
	src: true,
	streams: [{
		level: "error",
		path: path.join(config.dirs.logs, "/err.log"),
		period: "1d",
		count: 10 
	}, {
		level: "info",
		stream: process.stdout,
	}, {
		level: "debug",
		path: path.join(config.dirs.logs, "/debug.log"),
		period: "1d",
		count: 10 
	},  {
		level: "info",
		path: path.join(config.dirs.logs, "/out.log"),
		period: "1d",
		count: 10 
	}]
});

module.exports.log = module.exports.info;