import Environment from "./parsing/Environment"
import Interpreter from "./parsing/Interpreter"
import fs = require("fs");

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