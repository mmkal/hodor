import Environment from "./parsing/Environment"
import Interpreter from "./parsing/Interpreter"
import {Transpiler} from "./hodor/Transpiler";
import fs = require("fs");

const foo = Transpiler.Hodor("Hello I'm Misha.");
console.log(foo);
const bar = Transpiler.Wylis(foo);
console.log(bar);

const globalEnv = new Environment();

// define the "print" primitive function
globalEnv.def("print", function(txt: any){
  console.log(txt);
});

function run(code: string) {
    new Interpreter(globalEnv).execute(code);
}

const code = fs.readFileSync(process.argv[2], "utf8");

run(code);