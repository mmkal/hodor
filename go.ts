import Environment from "./lang/Environment";
import Interpreter from "./lang/Interpreter";
import {Transpiler} from "./encoding/Transpiler";
import fs = require("fs");

const interpreter = Environment.createStandard().createInterpreter();

function buildQuine() {
    const evalableLines = [
        ``,
        `@s = fromCharCode(64) + fromCharCode(34);`,
        `@e = fromCharCode(34) + fromCharCode(64);`,
        `print("@c = "+@s+hhodor(@c)+@e+";eval(@c);")`,
        ``
    ];

    function hodoriseQuotes(code: string) {
        return code.replace(/"([^"]+)"/g, (match, group1) => `"` + Transpiler.Hodor(group1) + `"`);
    }
    function hodoriseVariables(code: string) {
        return code.replace(/@(\w+?)\b/g, (match, group1) => `'` + Transpiler.Hodor(group1) + `'`);
    }

    /// the string literal will be evaled, so literals inside it need to be hodorised
    const substringsHodorisedLines = evalableLines.map(line => {
        line = hodoriseVariables(line);
        line = hodoriseQuotes(line);
        return line;
        // const hodorisedQuotes = hodoriseQuotes(line);
        // const hodorisedVariables = hodoriseVariables(hodorisedQuotes);
        // return hodorisedVariables;
    });

    const evalableString = substringsHodorisedLines.join(`\r\n`);

    const hodorisedEvalableString = Transpiler.Hodor(evalableString);

    const quine = hodoriseVariables(`@c = @"`) + hodorisedEvalableString + hodoriseVariables(`"@;eval(@c);`);

    return quine;
};

let source = buildQuine();
let output = "";
interpreter.env.def("print", (message: string) => output += message);

// source = `'HODOR.' = "Hodor."; print(E);`; 

interpreter.execute(source);

console.log("Is quine?");
console.log(output === source);

if (output === source){
    fs.writeFileSync("foo.hodor", source, { encoding: "utf8" });
}
else {
    console.log("source########\r\n");
    console.log(source);
    console.log("output########\r\n");
    console.log(output);
}

process.exit();


// const interpreter = Environment.createStandard().createInterpreter();
// let output = "";
// interpreter.env.def("print", (message: string) => output += message);
// const source = fs.readFileSync("foo.hodor", "utf8");


// console.log(Transpiler.Hodor(Transpiler.Hodor(";eval(c);")));

// const hodor = Transpiler.Hodor(source);
// console.log(hodor);

// interpreter.execute(source);
// console.log("Is quine?");
// console.log(output === source);
// if (output !== source) {
//     console.log("source########\r\n");
//     console.log(source);
//     console.log("output########\r\n");
//     console.log(output);
// }
// process.exit();