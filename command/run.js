var _ = require("underscore"),
	ssh2 = require("ssh2"),
	jsonfile = require("jsonfile"),
	config = require("../config/config"),
	deferrize = require("../util/deferrize");

module.exports = function(colors, options) {
	options = options || {};
	
	var projectDir,
		conn = new ssh2.Client(),
		readJSONFile = deferrize(jsonfile.readFile, 0),
		connExecuteCommand;
	
	readJSONFile(config.CONFIG_FILE).done(function(settings) {
		
		var runCommand = config.RUN_COMMAND + " " + settings.projectName + config.DEFAULT_SEPARATOR + settings.mainFile;
		
		connExecuteCommand = deferrize(_.bind(conn.exec, conn), 0);
		
		conn.on('ready', function() {
			connExecuteCommand(runCommand).done(function(stream) {
				stream.on('close', function() {
					conn.end();
				}).on('data', function(data) {
					console.log(data.toString());
				}).stderr.on('data', function(data) {
					console.log(data.toString());
				});	
			}, function(err) {
				console.log(err);
			});
		});
		
		conn.connect({
			host: settings.host,
			port: settings.port,
			username: settings.username,
			password: settings.password
		});
		
	}, function(err) {
		console.log(colors.red(err));
	});
}