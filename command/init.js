var jsonfile = require('jsonfile');

jsonfile.spaces = 4;

module.exports = function(options) {
	options = options || {};
	
	var username = options.username || "",
		password = options.password || "",
		host = options.host || "localhost",
		port = options.port || "";
	
	var file = 'edison.json';
	
	var settings = {
		username: username,
		password: password,
		host: host,
		port: port
	};

	jsonfile.writeFile(file, settings, function (err) {
	  err ? console.error(err) : console.log("File created.");
	});	  
}