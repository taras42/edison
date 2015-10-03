var jsonfile = require("jsonfile"),
	config = require("../config/config");

jsonfile.spaces = config.JSON_FILE_SPACES;

module.exports = function(colors, options) {
	options = options || {};
	
	var settings = {
		username: options.username || config.USERNAME,
		password: options.password || config.PASSWORD,
		host: options.host || config.HOST,
		port: options.port || config.PORT,
		projectName: options.projectName || config.PROJECT_NAME,
		mainFile: options.mainFile || config.MAIN_FILE,
		deployDirectory: options.deployDirectory || config.DEPLOY_DIRECTORY
	};

	jsonfile.writeFile(config.CONFIG_FILE, settings, function (err) {
	  err 
		? console.error(colors.red(err)) 
	  	: console.log(colors.green("Config file created successfully."));
	});	  
}