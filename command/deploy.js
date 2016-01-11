var sequest = require("sequest"),
	_ = require("underscore"),
	read = require('fs-readdir-recursive')
	deferred = require("deferred"),
	jsonfile = require("jsonfile"),
	config = require("../config/config"),
	path = require('path'),
	fs = require("fs");

// separator
var separator = process.platform === config.PLATFORM.WIN32 
				? "\\"
				: config.DEFAULT_SEPARATOR;

// copy project to edison
function _copy(seq, files, cwd, colors, target, dfd, index) {
	index = index || 0;
	
	if (index >= files.length) {
		dfd.resolve();
		return;
	}
	
	var splitedPath = files[index].split(separator),
		fullFilePath = splitedPath.join(config.DEFAULT_SEPARATOR),
		pathToFile = splitedPath.slice(0, splitedPath.length - 1).join(config.DEFAULT_SEPARATOR),
		targetDir = target + config.DEFAULT_SEPARATOR + pathToFile;
	
	seq("mkdir -p " + targetDir, function(err, stdout) {
		writer = seq.put([target, fullFilePath].join(config.DEFAULT_SEPARATOR));
		fs.createReadStream(cwd + config.DEFAULT_SEPARATOR + fullFilePath).pipe(writer);

		writer.on('close', function () {
			console.log(colors.green(fullFilePath + " copied."));
			_copy(seq, files, cwd, colors, target, dfd, index + 1);
		});	
	});
}

function copy(seq, settings, colors) {
	var dfd = deferred(),
		cwd = process.cwd(),
		files = read(cwd),
		target = config.PROJECT_NAME;
	
	seq("mkdir " + target, function(err, stdout) {
		if (err) {
			console.log(colors.red(stdout));
		}
		
		_copy(seq, files, cwd, colors, target, dfd);
	});
	
	return dfd.promise;
}

function deploy(colors, options) {
	options = options || {};
	
	var userHostInfo,
		seq;
	
	jsonfile.readFile(config.CONFIG_FILE, function(err, settings) {
  		if(err) {
			console.log(colors.red(err));
		} else {
			
			userHostInfo = settings.username + "@" + settings.host;
			
			seq = sequest.connect(userHostInfo, {
				password: settings.password
			});
			
			// relatively /home/root
			seq("cd " + settings.deployDirectory, function(err, stdout) {
				if(err) {
					console.log(colors.red(err));
				} else {
					copy(seq, settings, colors).done(function() {
						console.log(colors.green("Deploy successful."));
						seq.end();
					});
				}
			});
		}
	});
}

module.exports = deploy;