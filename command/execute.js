var _ = require("underscore"),
	ssh2 = require("ssh2"),
	jsonfile = require("jsonfile"),
	config = require("../config/config"),
	deferrize = require("../util/deferrize");

module.exports = function(colors, command) {
	
	var projectDir,
		conn = new ssh2.Client(),
		readJSONFile = deferrize(jsonfile.readFile, 0);

	if (_.isString(command)) {
		readJSONFile(config.CONFIG_FILE).done(function(settings) {
			
			conn.on("ready", function() {
				var cdToProject = config.CD_DIR_COMMAND + " " + settings.deployDirectory + config.DEFAULT_SEPARATOR + settings.projectName,
					connExecuteCommand = deferrize(_.bind(conn.exec, conn), 0);

				connExecuteCommand(cdToProject).done(function() {
					connExecuteCommand(command).done(function(stream) {
						stream.on('close', function() {
							conn.end();
						}).on('data', function(data) {
							console.log(data.toString());
						}).stderr.on('data', function(data) {
							console.log(data.toString());
						});			
					}, function(err) {
						console.log(colors.red(err));
					});
				}, function(err) {
					console.log(colors.red(err));
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
		
	} else {
		console.log(colors.red("Please, provide command to run. See help."));
	}
}