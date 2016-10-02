import test from "ava";
import fs = require("fs");
import Environment from "../../lang/Environment";
import Interpreter from "../../lang/Interpreter";
import glob = require("glob");
import {packageDir} from "../_ava-meta";

test.todo("Check out pify", null);

function executeAndGetOutput(code: string) {
    let output = "";
    const interpreter = Environment.createStandard().createInterpreter();
    interpreter.env.def("print", (message: string) => output += message);
    interpreter.execute(code);

    return output;
}

const hodorTests: { [filename: string]: (filepath: string, code: string) => void } = {
    ["quine.hodor"]: (filepath, code) => {
        test(`${filepath} should be a quine`, t => {
            t.is(executeAndGetOutput(code), code);
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