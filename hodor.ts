import Environment from "./parsing/Environment"
import Interpreter from "./parsing/Interpreter"

declare var process: any, require: any;

const globalEnv = new Environment();

// define the "print" primitive function
globalEnv.def("print", function(txt: any){
  console.log(txt);
});
function run(code: string) {
    new Interpreter(globalEnv).execute(code);
}

// run("sum = lambda(x, y) x + y; print(sum(2, 3));");
// run("sum = lambda(x, y) x + y; print(sum(2, 3));");
// run("sum = lambda(x, y) x + y; print(sum(2, 3));");
// run("sum = lambda(x, y) x + y; print(sum(2, 3));");
// run("sum = lambda(x, y) if (x > y and x > 0) then x else y; print(sum(2, 3));");
// run("sum = lambda(x, y) if (x > y and x > 0) then x else y; print(sum(5, 3));");
run("sum = Hodor(x, y) Hodor? (x > y and x > 3) Hodor! HODOR! Hodor!! hodor; print(sum(2, 1));");
run("sum = Hodor(x, y) Hodor? (x > y and x > 3) Hodor! HODOR! Hodor!! hodor; print(sum(2, 1));");