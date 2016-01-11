var deferred = require("deferred"),
	_ = require("underscore");

function callback(dfd, errIndex) {
	var args = Array.prototype.slice.call(arguments, 0),
		err;
	
	// splice dfd and errorIndex args
	args.splice(0, 2);
	
	// get error obj
	err = args[errIndex]; 
	
	// splice error object so done callback can recieve proper args
	args.splice(errIndex, 1);
	
	err 
		? dfd.reject(err)
		: dfd.resolve.apply(dfd, args);
}

// errIndex - index of error arg. Depends from target function implementation.
module.exports = function(fn, errIndex) {
	return function() {
		var args = Array.prototype.slice.call(arguments, 0),
			dfd = deferred();
		
		args = args.concat(_.partial(callback, dfd, errIndex));
		
		// need to pass arguments to target function without context changing
		// use partial as a wrapper.
		_.partial.apply(_, [fn].concat(args))();
		
		return dfd.promise;
	}
}