declare var process: any, require: any;

setTimeout(function() {

var globalEnv = new Environment();

// define the "print" primitive function
globalEnv.def("print", function(txt: any){
  console.log(txt);
});
function run(code: string) {
    new Interpreter(globalEnv).execute(code);
}

run("sum = lambda(x, y) x + y; print(sum(2, 3));");

}, 0);