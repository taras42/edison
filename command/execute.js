var _ = require("underscore"),
	ssh2 = require("ssh2"),
	config = require("../config/config"),
	settings = require("../util/settings"),
	deferrize = require("../util/deferrize");

module.exports = function(colors, command) {
	
	var conn = new ssh2.Client(),
		readJSONFile = deferrize(jsonfile.readFile, 0);

	if (_.isString(command)) {
		
		settings().done(function(settingsObj) {
			conn.on("ready", function() {
				var cdToProjectDir = config.CD_DIR_COMMAND + " " + settings.projectName;

				conn.shell(function(err, stream) {
					var output = "",
						skipFirstBuffer = true;
					
					if (err) {
						console.log(colors.red(err));
						return;
					}
					
					stream.on('close', function() {
						// TODO: format output
						console.log(output);
						conn.end();
					}).on('data', function(data) {
						// first buffer contains our commands, need to skip it.
						if (skipFirstBuffer) {
							skipFirstBuffer = false;
							return;
						}
						
						// collect chanks of data.
						output += data.toString();
					}).stderr.on('data', function(data) {
						console.log(data.toString());
					});
					
					stream.write(cdToProjectDir + "\n");
					stream.write(command + "\n");
					stream.end("exit\n");
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
		
	} else {
		console.log(colors.red("Please, provide command to run. See help."));
	}
}