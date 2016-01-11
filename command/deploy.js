var sequest = require("sequest"),
	_ = require("underscore"),
	read = require("fs-readdir-recursive")
	deferred = require("deferred"),
	jsonfile = require("jsonfile"),
	config = require("../config/config"),
	path = require("path"),
	fs = require("fs"),
	deferrize = require("../util/deferrize");

// separator
var separator = process.platform === config.PLATFORM.WIN32 
				? "\\"
				: config.DEFAULT_SEPARATOR,
	seqDfdWrapper;

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
		targetDir = target + config.DEFAULT_SEPARATOR + pathToFile,
		command = config.MKDIR_COMMAND + " -p " + targetDir;
	
	seqDfdWrapper(command).done(function(stdout) {
		writer = seq.put([target, fullFilePath].join(config.DEFAULT_SEPARATOR));
		fs.createReadStream(cwd + config.DEFAULT_SEPARATOR + fullFilePath).pipe(writer);

		writer.on('close', function () {
			console.log(colors.green(fullFilePath + " copied."));
			_copy(seq, files, cwd, colors, target, dfd, index + 1);
		});	
	}, function(err) {
		console.log(colors.red(err));
	});
}

function copy(seq, settings, colors) {
	var dfd = deferred(),
		cwd = process.cwd(),
		files = read(cwd),
		target = config.PROJECT_NAME,
		command = config.MKDIR_COMMAND + " " + target;
	
	seqDfdWrapper(command).done(function() {
		_copy(seq, files, cwd, colors, target, dfd);
	}, function(err) {
		console.log(colors.red(err));
	});
	
	return dfd.promise;
}

function deploy(colors, options) {
	options = options || {};
	
	var userHostInfo,
		seq,
		command,
		readJSONFile = deferrize(jsonfile.readFile, 0);
	
	readJSONFile(config.CONFIG_FILE).done(function(settings) {
		userHostInfo = settings.username + "@" + settings.host;
			
		seq = sequest.connect(userHostInfo, {
			password: settings.password
		});
		
		seqDfdWrapper = deferrize(seq, 0);
		
		command = config.CD_DIR_COMMAND + " " + settings.deployDirectory;
		
		seqDfdWrapper(command).done(function() {
			copy(seq, settings, colors).done(function() {
				console.log(colors.green("Deploy successful."));
				seq.end();
			});
		}, function(err) {
			console.log(colors.red(err));	
		});

		// relatively /home/root
	}, function(err) {
		console.log(colors.red(err));
	});
}

module.exports = deploy;