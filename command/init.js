var jsonfile = require("jsonfile"),
	config = require("../config/config");

jsonfile.spaces = config.JSON_FILE_SPACES;

module.exports = function(colors, options) {
	options = options || {};
	
	var username = options.username || config.USERNAME,
		password = options.password || config.PASSWORD,
		host = options.host || config.HOST,
		port = options.port || config.PORT;
	
	var settings = {
		username: username,
		password: password,
		host: host,
		port: port
	};

	jsonfile.writeFile(config.CONFIG_FILE, settings, function (err) {
	  err 
		? console.error(colors.red(err)) 
	  	: console.log(colors.green("Config file created successfully."));
	});	  
}