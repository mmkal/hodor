import Environment from "./lang/Environment";
import Interpreter from "./lang/Interpreter";
import {Transpiler} from "./encoding/Transpiler";
import fs = require("fs");




const interpreter = Environment.createStandard().createInterpreter();
let output = "";
interpreter.env.def("print", (message: string) => output += message);
const source = fs.readFileSync("test/lang/quine.hodor", "utf8");

const hodor = Transpiler.Hodor(source);

interpreter.execute(source);
console.log("Is quine?");
console.log(output === source);
if (output !== source) {
    console.log("source########\r\n");
    console.log(source);
    console.log("output########\r\n");
    console.log(output);
}
process.exit();