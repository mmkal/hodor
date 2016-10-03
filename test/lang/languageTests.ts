import {test, packageDir} from "../_ava-shim";
import fs = require("fs");
import Environment from "../../lang/Environment";
import Interpreter from "../../lang/Interpreter";
import {Hodor} from "../../lang/Hodor";
import glob = require("glob");

function executeAndGetOutput(code: string) {
    let output = "";
    const interpreter = Environment.createStandard().createInterpreter();
    interpreter.env.def("print", (message: string) => output += message + "\r\n");
    interpreter.execute(code);

    return output;
}

const hodorTests: { [pathEnding: string]: (filepath: string, code: string) => void } = {
    ["quine.hodor"]: (filepath, code) => {
        test(`${filepath} should be a quine`, t => {
            t.is(executeAndGetOutput(code), code);
        });
    },
    [""]: (filepath, code) => {
        test(filepath + " should not throw", t => t.notThrows(() => executeAndGetOutput(code)));
    }
}

const matchedPathEndings = new Set<string>();
const availablePathEndings = Object.keys(hodorTests); 
glob.sync(packageDir + "/**/*.hodor").forEach(filepath => {
    const code = fs.readFileSync(filepath, "utf8");
    availablePathEndings
        .filter(pathEnding => filepath.endsWith(pathEnding))
        .forEach(pathEnding => {
            hodorTests[pathEnding](filepath, code);
            matchedPathEndings.add(pathEnding);
        });
});

availablePathEndings.forEach(path => {
    test(`Path ending "${path}" should have matched at some point`, t => t.true(matchedPathEndings.has(path)));
});

function buildQuine() {
    const evalableLines = [
        ``,
        `$s = $fromCharCode(64) + $fromCharCode(34);`,
        `$e = $fromCharCode(34) + $fromCharCode(64);`,
        `$print("$c = "+$s+$hodor($c)+$e+";$eval($c);")`,
        ``
    ];

    const n00b = `
$s = $fromCharCode(64) + $fromCharCode(34);
$e = $fromCharCode(34) + $fromCharCode(64);
$print("$c = "+$s+$hodor($c)+$e+";$eval($c);")
`;
    const evalable = Hodor.n00b(n00b);
    const literal = Hodor.Hodor(evalable);

    const quine = Hodor.n00b(`$c = @"`) + literal + Hodor.n00b(`"@;$eval($c);\r\n`);

    // let hodor = Hodor.n00b(evalableLines.join("\r\n"));

    // function hodoriseQuotes(code: string) {
    //     return code.replace(/"([^"]+)"/g, (match, group1) => `"` + Hodor.Hodor(group1) + `"`);
    // }
    // function hodoriseVariables(code: string) {
    //     return code.replace(/\$(\w+?)\b/g, (match, group1) => `'` + Hodor.Hodor(group1) + `'`);
    // }

    // /// the string literal will be evaled, so literals inside it need to be hodorised
    // const substringsHodorisedLines = evalableLines.map(line => {
    //     line = hodoriseVariables(line);
    //     line = hodoriseQuotes(line);
    //     return line;
    // });

    // const evalableString = substringsHodorisedLines.join(`\r\n`);

    // const b1 = hodor === evalableString;
    // hodor = Hodor.n00b(`$c = @"`) + Hodor.Hodor(hodor) + Hodor.n00b(`"@;$eval($c);\r\n`);

    // const hodorisedEvalableString = Hodor.Hodor(evalableString);

    // const quine = hodoriseVariables(`$c = @"`) + hodorisedEvalableString + hodoriseVariables(`"@;$eval($c);\r\n`);

    // console.log(hodor === quine);

    return quine;
};

test(`${buildQuine.name} should build a quine`, t => {
    const quine = buildQuine();
    const output = executeAndGetOutput(quine);
    t.is(output, quine);
});