import Environment from "./lang/Environment";
import Interpreter from "./lang/Interpreter";
import fs = require("fs");

const interpreter = new Environment().withConsoleLogger().createInterpreter();
interpreter.execute(fs.readFileSync("test/lang/hodor.hodor", "utf8"));
console.log(123);