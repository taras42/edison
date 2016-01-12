var jsonfile = require("jsonfile"),
	config = require("../config/config"),
	deferrize = require("../util/deferrize");

jsonfile.spaces = config.JSON_FILE_SPACES;

module.exports = function(colors, options) {
	options = options || {};
	
	var settings = {
		username: options.username || config.USERNAME,
		password: options.password || config.PASSWORD,
		host: options.host || config.HOST,
		port: options.port || config.PORT,
		projectName: options.projectName || config.PROJECT_NAME,
		mainFile: options.mainFile || config.MAIN_FILE
	},
		writeJSONFile = deferrize(jsonfile.writeFile, 0);
	
	
	writeJSONFile(config.CONFIG_FILE, settings).done(function() {
		console.log(colors.green("Configuration file successfully created."));
	}, function(err) {
		console.error(colors.red(err));
	});
}