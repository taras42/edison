var sequest = require("sequest"),
	jsonfile = require("jsonfile"),
	config = require("../config/config"),
	fs = require("fs");

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
			seq("cd " + settings.deployDirectory, function(err, stdout) {
				if(err) {
					console.log(colors.red(err));
				} else {
					var writer = seq.put('./p.json');
					fs.createReadStream(process.cwd() + '/package.json').pipe(writer);
					writer.on('close', function () {
						console.log(colors.green("Deploy successful."));
						seq.end();
					});
				}
			});
		}
	});
}