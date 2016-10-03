import {test, packageDir} from "../_ava-shim";
import fs = require("fs");
import Environment from "../../lang/Environment";
import Interpreter from "../../lang/Interpreter";
import Hodor from "../../lang/Hodor";
import Samples from "../../lang/Samples";
import glob = require("glob");

function executeAndGetOutput(code: string) {
    const output = new Array<string>();

    const interpreter = Environment.createStandard().createInterpreter();
    interpreter.env.def("print", (message: string) => output.push(message));
    interpreter.execute(code);

    return output.join("\r\n");
}

const hodorTests: { [pathEnding: string]: (filepath: string, code: string) => void } = {
    ["quine.hodor"]: (filepath, code) => {
        test(`${filepath} should be a quine`, t => t.is(executeAndGetOutput(code), code));
    },
    ["hello.hodor"]: (filepath, code) => {
        test(`${filepath} should output hello world`, t => t.is(executeAndGetOutput(code), "Hello, world!"));
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

test("Print hello world", t => {
    t.is(executeAndGetOutput(Samples.HelloWorld()), "Hello, World!");
});

test(`${Samples.Quine.name} should build a quine`, t => {
    const quine = Samples.Quine();
    const output = executeAndGetOutput(quine);
    t.is(output, quine);
});