var sequest = require("sequest"),
	jsonfile = require('jsonfile'),
	config = require("../config/config");

module.exports = function(colors, options) {
	options = options || {};
	
	jsonfile.readFile(config.CONFIG_FILE, function(err, settings) {
  		if(err) {
			console.log(colors.red(err));
		} else {
			
			var userHostInfo = settings.username + "@" + settings.host;
			
			sequest(userHostInfo, 
				{
					command: 'ls',
					password: settings.password
				}, 
				function (err, stdout) {
					err 
						? console.log(colors.red(err))
						: console.log(stdout);
				}
			);		
		}
	});
}