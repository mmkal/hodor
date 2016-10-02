import Environment from "./lang/Environment";
import Interpreter from "./lang/Interpreter";
import fs = require("fs");

const interpreter = Environment.createStandard().createInterpreter();
let output = "";
interpreter.env.def("print", (message: string) => output += message);
const source = fs.readFileSync("test/lang/quine.hodor", "utf8");
interpreter.execute(source);
console.log("Is quine?");
console.log(output === source);
process.exit();