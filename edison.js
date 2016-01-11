#!/usr/bin/env node

var _ = require("underscore"),
	path = require("path"),
	program = require("commander"),
	colors = require("colors/safe");

// colors
colors.enabled = true;

// commands
var init = require("./command/init"),
	run = require("./command/run"),
	deploy = require("./command/deploy");

// init command
program
  	.command("init")
  	.description("Initialize project configuration file")
	.option("-u, --username [username]", "Username")
	.option("-p, --password [password]", "Password")
	.option("-h, --host [host]", "Host")
	.option("-port, --port [port]", "Port")
	.option("-pN, --projectName [projectName]", "Project name")
	.option("-mF, --mainFile [mainFile]", "Main file")
	.option("-dD, --deployDirectory [deployDirectory]", "Deploy directory")
  	.action(_.partial(init, colors));

// run command
program
  	.command("run")
  	.description("Run project on edison")
  	.action(_.partial(run, colors));

// deploy command
program
  	.command("deploy")
  	.description("Deploy project to edison")
  	.action(_.partial(deploy, colors));

program.parse(process.argv);

// info
//console.log(colors.white("Simple command line tool for deploy"));
//console.log(colors.white("and run projects on"), colors.cyan("Intel Edison."));
//console.log(colors.white("Use --help for more options."));
//console.log(colors.white("v0.0.1"));