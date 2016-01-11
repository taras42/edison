var sequest = require("sequest"),
	jsonfile = require("jsonfile"),
	config = require("../config/config");

module.exports = function(colors, options) {
	options = options || {};
	
	var userHostInfo,
		seq,
		projectDir,
		runCommand;
	
	jsonfile.readFile(config.CONFIG_FILE, function(err, settings) {
  		if(err) {
			console.log(colors.red(err));
		} else {
			
			userHostInfo = settings.username + "@" + settings.host;
			
			seq = sequest.connect(userHostInfo, {
				password: settings.password
			});
			
			projectDir = settings.deployDirectory + config.DEFAULT_SEPARATOR + settings.projectName;
			runCommand = config.RUN_COMMAND + " " + projectDir + config.DEFAULT_SEPARATOR + settings.mainFile;
			
			// relatively /home/root
			seq(runCommand, function(err, stdout) {
				if(err) {
					console.log(colors.red(err));
				} else {
					if(err) {
						console.log(colors.red(err));	
					} else {
						console.log(colors.green("Project started."));
						console.log(colors.green(stdout));
						seq.end(); // terminate?
					}
				}
			});
		}
	});
}