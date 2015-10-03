#!/usr/bin/env node

var _ = require("underscore"),
	sequest = require("sequest"),
	program = require("commander"),
	colors = require("colors/safe");

// colors
colors.enabled = true;

// commands
var init = require("./command/init");

program
  	.command("init")
  	.description("Initialize project configuration file")
	.option("-u, --username [username]", "Username")
	.option("-p, --password [password]", "Password")
	.option("-h, --host [host]", "Host")
	.option("-port, --port [port]", "Port")
  	.action(_.partial(init, colors));

program.parse(process.argv);