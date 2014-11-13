var package = require("./package.json"),
	Server = require("./lib/server.js"),
	commander = require("commander")
	;

var server = new Server();
commander.version(package.version);


commander.command("listen")
	.description("inititalize app and listen port")
	.action(function() {
		server.listen();
	});


commander.command("install")
	.description("install app in new environment")
	.action(function() {
		server.install();
	});

commander.command("*")
	.description("help")
	.action(function() {
		commander.help();
	});

if(process.argv.length === 2) {
	commander.help();
}


commander.parse(process.argv);

