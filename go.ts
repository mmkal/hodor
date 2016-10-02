import Environment from "./lang/Environment";
import {Transpiler} from "./encoding/Transpiler";
import fs = require("fs");

const interpreter = Environment.createStandard().createInterpreter();

function buildQuine() {
    const evalableLines = [
        ``,
        `@s = fromCharCode(64) + fromCharCode(34);`,
        `@e = fromCharCode(34) + fromCharCode(64);`,
        `print("@c = "+@s+@hhodor(@c)+@e+";@eval(@c);")`,
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
    });

    const evalableString = substringsHodorisedLines.join(`\r\n`);

    const hodorisedEvalableString = Transpiler.Hodor(evalableString);

    const quine = hodoriseVariables(`@c = @"`) + hodorisedEvalableString + hodoriseVariables(`"@;@eval(@c);\r\n`);

    return quine;
};

let source = buildQuine();
let output = "";

interpreter.env.def("print", (message: string) => output += message + "\r\n");

interpreter.execute(source);

if (output !== source) throw new Error("Didn't produce a valid quine.");
fs.writeFileSync("test/lang/quine.hodor", source, { encoding: "utf8" });

process.exit();