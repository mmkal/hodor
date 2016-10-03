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

const hodorTests: { [filename: string]: (filepath: string, code: string) => void } = {
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

glob.sync(packageDir + "/test/**/*.hodor").forEach(filepath => {
    const code = fs.readFileSync(filepath, "utf8");
    Object.keys(hodorTests)
        .filter(filename => filepath.endsWith(filename))
        .forEach(filename => hodorTests[filename](filepath, code));
});