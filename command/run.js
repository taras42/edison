var sequest = require("sequest"),
	jsonfile = require("jsonfile"),
	config = require("../config/config");

module.exports = function(colors, options) {
	options = options || {};
	
	jsonfile.readFile(config.CONFIG_FILE, function(err, settings) {
  		if(err) {
			console.log(colors.red(err));
		} else {
			
			var userHostInfo = settings.username + "@" + settings.host;
			
			var seq = sequest.connect(userHostInfo, {
				password: settings.password
			});
			
			// relatively /home/root
			seq("cd " + settings.projectName, function(err, stdout) {
				if(err) {
					console.log(colors.red(err));
				} else {
					seq("node " + settings.mainFile, function(err, stdout) {
						if(err) {
							console.log(colors.red(err));	
						} else {
							console.log(colors.green("Project started."));
							console.log(colors.green(stdout));
							seq.end(); // terminate?
						}
					});
				}
			});
		}
	});
}