#!/usr/bin/env node

var _ = require("underscore"),
	program = require("commander"),
	colors = require("colors/safe");

// colors
colors.enabled = true;

// commands
var init = require("./command/init"),
	run = require("./command/run");

// init command
program
  	.command("init")
  	.description("Initialize project configuration file")
	.option("-u, --username [username]", "Username")
	.option("-p, --password [password]", "Password")
	.option("-h, --host [host]", "Host")
	.option("-port, --port [port]", "Port")
	.option("-pN, --projectName [projectName]", "Project name")
	.option("-m, --main [main]", "Main file")
  	.action(_.partial(init, colors));

// run command
program
  	.command("run")
  	.description("Run project on edison")
  	.action(_.partial(run, colors));

program.parse(process.argv);