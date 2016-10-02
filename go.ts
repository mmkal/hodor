import Environment from "./lang/Environment";
import Interpreter from "./lang/Interpreter";
import {Transpiler} from "./encoding/Transpiler";
import fs = require("fs");

const interpreter = Environment.createStandard().createInterpreter();

function buildQuine() {
    const evalableLines = [
        ``,
        `s = fromCharCode(64) + fromCharCode(34);`,
        `e = fromCharCode(34) + fromCharCode(64);`,
        `print("c = "+s+hhodor(c)+e+";eval(c);")`,
        ``
    ];

    /// the string literal will be evaled, so literals inside it need to be hodorised
    const substringsHodorisedLines = evalableLines.map(line => {
        const hodorisedQuotes = line.replace(/"([^"]+)"/g, (match, group1) => `"` + Transpiler.Hodor(group1) + `"`);
        return hodorisedQuotes;
    });

    const evalableString = substringsHodorisedLines.join(`\r\n`);

    const hodorisedEvalableString = Transpiler.Hodor(evalableString);

    const quine = `c = @"` + hodorisedEvalableString + `"@;eval(c);`;

    return quine;
};

let source = buildQuine();
let output = "";
interpreter.env.def("print", (message: string) => output += message);

//source = `'HODOR!' = "Hodor."; print('HODOR!');`; 

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