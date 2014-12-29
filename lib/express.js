"use strict";

var console = require("./logger.js"),
	config = require("./config"),
	express = require("express"),
	bodyParser = require("body-parser"),
	passport = require("passport"),
	LocalStrategy = require('passport-local').Strategy,
	db = require("./db.js"),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	uuid = require('node-uuid'),
	//remove after testing
	authorization = require('./authorization.js'),
	filters = require('./db_modules/filters.js')

	
	
	;

var Express = function() {
	this.app = express();
	this.app.use(bodyParser.json());
	this.app.use(cookieParser());
	this.app.use(session({ secret: 'SECRET' }));
	this.app.use(passport.initialize());
	this.app.use(passport.session());
	//this must be removed when authorization factory created
	this.app.post('/auth/simple',authorization.authorizationCache.bind(this));
	this.app.post('/auth/logout',authorization.logout.bind(this));
	/*filters.convertQuery("mongodb",{
		limit : 5, 
		offset : 8,
		users : {
			sort : {
				phone : 1,
				name : -1,
				_id : 100
			}}
			search : {
				columns : ["phone", "name"],
				str : "12"
			},
			filters :{
				"test" : 12,
				"test1" : false,
				"test12" : {
					"gt" : 14,
					"lte" : true,
					"adasdfasf" : "qwe"
				},
				"test13" : "15",
				"test14" : "sadfdasdfas"
			},
			readColumns : ["asdf", "sdf"]
		}
		,
		tests : {
			search : {
				columns : ["phone","user"],
				str : "as12"
			},
			sort : {
				phone : 1
			},
			readColumns : ["asdf", "sdf"]
		}
	}, function(err,res){
		// console.log(err,res, "---------------")
		console.error(err);
		console.log(JSON.stringify(res));
	})*/
}

Express.prototype.getApp = function() {
	return this.app;
}

Express.prototype.listen = function(callback) {
	this.app.listen(config.port, function() {	
		console.log("server listen on %d", config.port);
		callback && callback();
	});
}

Express.prototype.expressify = function(handler, options) {
	options = options || { };
	return function(req, res) {
		var params = req.body;
		if (options.needAuth) {
			authorization.check(req,res,function(err,result) {
				err 
					? res.json({error : err, result : result})
					: handler(params,function(err,result){
						res.json({error: err, result: result});
					});
			});
		} else {
			handler(params, function(err, result) {
				res.json({error: err, result: result});
			});
		}	
	}
}


module.exports = new Express();