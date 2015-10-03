#!/usr/bin/env node

var fs = require('fs'),
	sequest = require("sequest"),
	program = require("commander");

// commands

var init = require('./command/init');

program
  	.command("init")
  	.description("Initialize project configuration file")
	.option("-u, --username [username]", "Username")
	.option("-p, --password [password]", "Password")
	.option("-h, --host [host]", "Host")
	.option("-port, --port [port]", "Port")
  	.action(init);

program.parse(process.argv);