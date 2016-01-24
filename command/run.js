var _ = require("underscore"),
	ssh2 = require("ssh2"),
	config = require("../config/config"),
	deferrize = require("../util/deferrize"),
	settings = require("../util/settings");

module.exports = function(colors, options) {
	options = options || {};
	
	var projectDir,
		conn = new ssh2.Client(),
		connExecuteCommand;
	
	settings().done(function(settingsObj) {
		var runCommand = config.RUN_COMMAND + " " + settingsObj.projectName + config.DEFAULT_SEPARATOR + settingsObj.mainFile;
		
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
			host: settingsObj.host,
			port: settingsObj.port,
			username: settingsObj.username,
			password: settingsObj.password
		});
	}, function(err) {
		console.log(colors.red(err));
	});
}