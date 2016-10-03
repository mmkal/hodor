#! /usr/bin/env node
import fs = require("fs");
import Environment from "./Environment";

const hodorArgv = process.argv.slice(2);
const code = fs.readFileSync(hodorArgv[0], "utf8");

const interpreter = Environment.createStandard().createInterpreter();

interpreter.execute(code);