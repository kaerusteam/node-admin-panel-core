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

commander.command("module <name>")
	.description("create new module with given name by template")
	.option("-c, --core", "create module in system's core")
	.option("-w, --web", "create module in web client")
	.option("-d, --database [dbname]", "which db use in template. Default - mongodb")
	.action(function(name, options){
		server.createModule(name, options);
	});

commander.command("migration <name>")
	.description("create new migration template for module with given name")
	.action(function(name, options){
		server.createMigration(name, options);
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

