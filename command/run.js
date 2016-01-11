var sequest = require("sequest"),
	jsonfile = require("jsonfile"),
	config = require("../config/config"),
	deferrize = require("../util/deferrize");

module.exports = function(colors, options) {
	options = options || {};
	
	var userHostInfo,
		seq,
		projectDir,
		runCommand,
		readJSONFile = deferrize(jsonfile.readFile, 0),
		seqDfdWrapper;
	
	readJSONFile(config.CONFIG_FILE).done(function(settings) {
		userHostInfo = settings.username + "@" + settings.host;
			
		seq = sequest.connect(userHostInfo, {
			password: settings.password
		})
		
		seqDfdWrapper = deferrize(seq, 0);

		projectDir = settings.deployDirectory + config.DEFAULT_SEPARATOR + settings.projectName;
		runCommand = config.RUN_COMMAND + " " + projectDir + config.DEFAULT_SEPARATOR + settings.mainFile;

		// relatively /home/root
		seqDfdWrapper(runCommand).done(function(stdout) {
			console.log(colors.green("Project started."));
			console.log(colors.green(stdout));
			seq.end(); // terminate?
		}, function(err) {
			console.log(colors.red(err));
		});
		
	}, function(err) {
		console.log(colors.red(err));
	});
}