var _ = require("underscore"),
	ssh2 = require("ssh2"),
	read = require("fs-readdir-recursive")
	deferred = require("deferred"),
	config = require("../config/config"),
	path = require("path"),
	fs = require("fs"),
	settings = require("../util/settings"),
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
	
	var conn = new ssh2.Client();
	
	settings().done(function(settingsObj) {
		
		connExecuteCommand = deferrize(_.bind(conn.exec, conn), 0);
		
		conn.on('ready', function() {
			copy(conn, settingsObj, colors).done(function() {
				console.log(colors.green("Deploy finished."));
				conn.end();
			});
		});
		
		conn.connect({
			host: settingsObj.host,
			port: settingsObj.port,
			username: settingsObj.username,
			password: settingsObj.password
		});
	}, function(err) {
		console.log(colors.red(err));
	});
}

module.exports = deploy;