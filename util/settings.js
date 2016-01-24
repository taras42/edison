var deferred = require("deferred"),
	jsonfile = require("jsonfile"),
	config = require("../config/config"),
	deferrize = require("../util/deferrize");

module.exports = function() {
	var dfd = deferred(),
		readJSONFile = deferrize(jsonfile.readFile, 0);
	
	readJSONFile(config.CONFIG_FILE).done(function(settings) {
		dfd.resolve(settings);
	}, function(err) {
		dfd.reject(err);
	});
	
	return dfd.promise;
}