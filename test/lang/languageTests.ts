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
    const wylis = `
$s = $fromCharCode(64) + $fromCharCode(34);
$e = $fromCharCode(34) + $fromCharCode(64);
$print("$c = "+$s+$hodor($c)+$e+";$eval($c);")
`;
    const hodor = Hodor.n00b(wylis);
    const literal = Hodor.Hodor(hodor);

    const quine = Hodor.n00b(`$c = @"`) + literal + Hodor.n00b(`"@;$eval($c);\r\n`);

    return quine;
};

test("Print hello world", t => {
    const code = Hodor.n00b(`$print("Hello, world!");`);
    const output = executeAndGetOutput(code);
    t.is(output, "Hello, world!\r\n");
});

test(`${buildQuine.name} should build a quine`, t => {
    const quine = buildQuine();
    const output = executeAndGetOutput(quine);
    t.is(output, quine);
});