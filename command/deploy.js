var ssh2 = require("ssh2"),
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
	connExecuteCommand;

// copy project to edison
function _copy(conn, files, cwd, colors, target, dfd, index) {
	index = index || 0;
	
	if (index >= files.length) {
		dfd.resolve();
		return;
	}
	
	var splitedPath = files[index].split(separator),
		fullFilePath = splitedPath.join(config.DEFAULT_SEPARATOR),
		pathToFile = splitedPath.slice(0, splitedPath.length - 1).join(config.DEFAULT_SEPARATOR),
		targetDir = target + config.DEFAULT_SEPARATOR + pathToFile,
		makeDirs = config.MKDIR_COMMAND + " -p " + targetDir;
	
	connExecuteCommand(makeDirs).done(function(stdout) {
		
		conn.sftp(function(err, sftp) {
			var then,
				writePath = [target, fullFilePath].join(config.DEFAULT_SEPARATOR),
				readPath = [cwd, splitedPath.join(separator)].join(separator);
			
			if (err) {
				console.log(colors.red(err));
				return;
			}
			
			var writer = sftp.createWriteStream(writePath);

			writer.on('close', function () {
				console.log(colors.green(readPath + " (" + (Date.now() - then) + "ms)"));
				sftp.end();
				_copy(conn, files, cwd, colors, target, dfd, index + 1);
			});
			
			then = Date.now();
			fs.createReadStream(readPath).pipe(writer);
		});
	
	}, function(err) {
		console.log(colors.red(err));
	});
}

function copy(conn, settings, colors) {
	var dfd = deferred(),
		cwd = process.cwd(),
		files = read(cwd),
		target = settings.projectName || config.PROJECT_NAME,
		command = config.MKDIR_COMMAND + " " + target;
	
	connExecuteCommand(command).done(function() {
		_copy(conn, files, cwd, colors, target, dfd);
	}, function(err) {
		console.log(colors.red(err));
	});
	
	return dfd.promise;
}

function deploy(colors, options) {
	options = options || {};
	
	var conn = new ssh2.Client(),
		readJSONFile = deferrize(jsonfile.readFile, 0);
	
	readJSONFile(config.CONFIG_FILE).done(function(settings) {
		
		connExecuteCommand = deferrize(_.bind(conn.exec, conn), 0);
		
		conn.on('ready', function() {
			copy(conn, settings, colors).done(function() {
				console.log(colors.green("Deploy finished."));
				conn.end();
			});
		});
		
		conn.connect({
			host: settings.host,
			port: settings.port,
			username: settings.username,
			password: settings.password
		});
	}, function(err) {
		console.log(colors.red(err));
	});
}

module.exports = deploy;