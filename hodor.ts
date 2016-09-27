declare var process: any, require: any;

setTimeout(function() {

var globalEnv = new Environment();

// define the "print" primitive function
globalEnv.def("print", function(txt: any){
  console.log(txt);
});
function run(code: string) {
    const inputStream = new InputStream(code);
    const tokenStream = new TokenStream(inputStream);
    const parser = new Parser(tokenStream);

    const ast = parser.parse();

    const interpreter = new Interpreter();

    const foo = interpreter.evaluate(ast, globalEnv);
}

run("sum = lambda(x, y) x + y; print(sum(2, 3));");

}, 10);