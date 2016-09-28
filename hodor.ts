import Environment from "./parsing/Environment"
import Interpreter from "./parsing/Interpreter"

// declare var process: any, require: any;

const globalEnv = new Environment();

// define the "print" primitive function
globalEnv.def("print", function(txt: any){
  console.log(txt);
});
function run(code: string) {
    new Interpreter(globalEnv).execute(code);
}
process.argv.forEach((val: any, index: any, arr: any) => {
  console.log(val, index, arr);
})
run("sum = Hodor(x, y) Hodor? (x > y Ho-dor x > 3) Hodor! HODOR Hodor!! hodor; print(sum(2, 1));");
run("sum = Hodor(x, y) (x > y Ho-dor x > 3); print(sum(2, 1));");