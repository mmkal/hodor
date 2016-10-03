import {test, packageDir} from "../_ava-shim";
import fs = require("fs");
import Environment from "../../lang/Environment";
import Interpreter from "../../lang/Interpreter";
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
    ["hodor.hodor"]: (filepath, code) => {
        test(`${filepath} should output stuff`, t=> {
            t.is(executeAndGetOutput(code), ["false", "false", "A b c", ""].join("\r\n"))
        });
    },
    [""]: (filepath, code) => {
        test(filepath + " should not throw", t => t.notThrows(() => executeAndGetOutput(code)));
    }
}

const matchedPathEndings = new Set<string>();
const availablePathEndings = Object.keys(hodorTests); 
glob.sync(packageDir + "/test/**/*.hodor").forEach(filepath => {
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