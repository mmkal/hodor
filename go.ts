import Environment from "./lang/Environment";
import Interpreter from "./lang/Interpreter";
import fs = require("fs");

const interpreter = Environment.createStandard().createInterpreter();
interpreter.execute(fs.readFileSync("quine.hodor", "utf8"));
console.log(123);