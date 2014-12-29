"use strict";

var console = require("./logger.js"),
	db = require("./db.js"),
	passport = require("passport"),
	uuid = require('node-uuid'),
	LocalStrategy = require('passport-local').Strategy
	;
/**
 * @class
 * @classdesc Module for registration user in system
 */
var Authorization = function() {
	this.db 			= db.getInstance("main");
	this.validator 		= require('jsonschema').Validator;
}

passport.serializeUser(function(user, done) {
  done(null, user._id);
});


passport.deserializeUser(function(id, done) {
	var innerDb = db.getInstance("main");
	innerDb.collection("users").findOne({ _id: id }, function(err, user) {
		if (err) {
			done(err);
		} else {
			done(null,user);
		}
	});
});

passport.use(new LocalStrategy({
	usernameField: 'login',
    passwordField: 'password'
},function(username, password, done){
	var innerDb = db.getInstance("main");
	innerDb.collection("users").findOne({ login: username }, function(err, user) {
		if (err) { 
			return done(err); 
		}
		if (!user) {
			return done(null, false, { message: 'Incorrect username.' });
		}
		if (user.password != password) {
			return done(null, false, { message: 'Incorrect password.' });
		} else {
			var uuidBuffer = new Buffer(16);
			uuid.v4(null, uuidBuffer, 0); 
			user.tokens = user.tokens || [];
			user.tokens.push(uuidBuffer.toString('hex').toUpperCase());
			innerDb.collection("users").update({_id : user._id}, user, {safe : true}, function(err, upd){
				if (err) {
					console.error(err);
					return done("Error with db work");
				} else {
					user.token = user.tokens[user.tokens.length - 1];
					delete user.tokens;
					return done(null, user);
				}
			});	
		}
	});
}));

/**
 * Very simple authorization user in system required login and pass, should be remake after create authorization factory
 * @param	{object}	req 	Request
 * @param	{object}	res 	Response
 * @param	{object}	next	Next function for work
 */
Authorization.prototype.authorizationCache = function(req,res,next){
	passport.authenticate('local',{sessions : true}, function(err,user,info){
		if (err) {
			return res.json({error : err ? err : info,result : user});
		}
		if (!user) {
			req.session.messages = info.message;
			return res.json({error : err ? err : info,result : user});
		}					
		req.logIn(user, function(err) {
			if (err) {
				req.session.messages = "Error"; 
				return res.json({error : err,result : user}); 
			}
			req.session.messages = "Login successfully";
			return res.json({error : null, result : user});
		});
	})(req, res, next);
}

/**
 * Check authorization user in system, should be remake after create authorization factory
 * @param	{object}	req 	Request
 * @param	{object}	res 	Response
 * @param	{object}	next	Next function for work
 */
Authorization.prototype.check = function(req,res,cb){
	var innerDb = db.getInstance("main");
	innerDb.collection("users").findOne({ tokens: req.body.token }, function(err, user) {
		if (err){
			console.error(err);
			cb({code : 500, message : "Error with db work",internalMessage : err});
		} else if (!user || !user.tokens || (user.tokens.indexOf(req.body.token) == -1)) {
			cb({code : 401, message : "User unauthorized"});
		} else {
			cb();
		}
	});
}

/**
 * Unauthorized user in system by token, should be remake after create authorization factory
 * @param	{object}	req 	Request
 * @param	{object}	res 	Response
 * @param	{object}	next	Next function for work
 */
Authorization.prototype.logout = function(req,res,next){
	var innerDb = db.getInstance("main");
	innerDb.collection("users").findOne({ tokens: req.body.token }, function(err, user) {
		if (err) { 
			res.json({error : {code : 500, message : "Error with db work"}, result : null});
		} else if (!user) {
			res.json({error : {code : 401, message : "User not found or unauthorized"}, result : null});
		} else {
			innerDb.collection("users").update({"_id" : user._id}, {$pull : {"tokens" : req.body.token}}, {safe : true}, function(err, updRes) {
				if (err) {
					console.error(err);
					res.json({error : {code : 500, message : "Error with db work"}, result : null});
				} else {
					req.logout();
					res.json({error : null, result : true});
				}
			});
		}
	});	 		
}

module.exports = new Authorization();