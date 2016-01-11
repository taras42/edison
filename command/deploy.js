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
function copy(seq, files, cwd, colors, target, dfd, index) {
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
			copy(seq, files, cwd, colors, target, dfd, index + 1);
		});	
	});
}

// clean up project on edison
function cleanUp(seq, settings, colors, target) {
	var dfd = deferred(),
		excludeArray = _.map(settings.exclude, function(exclude) {
			return new RegExp("\/" + exclude); // for now
		}),
		filesToRemove;

	
	seq("find ./" + target + " -depth", function(err, stdout) {
		var splitedSTD = stdout.split("\n");
		
		filesToRemove = _.filter(splitedSTD.slice(0, splitedSTD.length - 1), function(file) {
			return !_.find(excludeArray, function(regexp) {
				return file.match(regexp);
			});
		});
		
		dfd.resolve();
	});
	
	return dfd.promise;
}

function copyFn(seq, settings, colors) {
	var dfd = deferred();
	var cwd = process.cwd();
	
	// filter what's in exclude
	var files = read(cwd, function(filePath) {
		return !_.find(config.EXCLUDE, function(exclude) {
			return filePath.match(exclude);
		});	
	});
	
	var target = config.PROJECT_NAME;
	
	seq("mkdir " + target, function(err, stdout) {
		if (err) {
			console.log(colors.red(stdout));
			console.log(colors.green("Project will be copied to existing folder"));
		}
		
		cleanUp(seq, settings, colors, target).done(function() {
			copy(seq, files, cwd, colors, target, dfd);
		});
	});
	
	return dfd.promise;
}

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
					copyFn(seq, settings, colors).done(function() {
						console.log(colors.green("Deploy successful."));
						seq.end();
					});
				}
			});
		}
	});
}