#!/usr/bin/env node

var fs = require('fs'),
	sequest = require("sequest"),
	program = require("commander");

program
  .command("init")
  .description("Initialize project configuration file")
  .action(function(env, options){
    console.log("Hell yeah!");
  });

program.parse(process.argv);