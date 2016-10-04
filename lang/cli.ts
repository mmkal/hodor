#! /usr/bin/env node
import fs = require("fs");
import Environment from "./Environment";

const hodorArgv = process.argv.slice(2);
const __hodorfile = hodorArgv[0];

const code = fs.readFileSync(__hodorfile, "utf8");

const interpreter = Environment.createStandard().withKVs({__hodorfile}).createInterpreter();

interpreter.execute(code);