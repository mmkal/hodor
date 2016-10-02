import test from "ava";
import fs = require("fs");
import Environment from "../../lang/Environment";
import Interpreter from "../../lang/Interpreter";
import glob = require("glob");
import {packageDir} from "../_ava-meta";

test.todo("Multi-line string literals", null);

test.todo("Quine", null);

test.todo("Check out pify", null);

function executeAndGetOutput(code: string) {
    let output = "";
    const interpreter = Environment.createStandard().createInterpreter();
    interpreter.env.def("print", (message: string) => output += message);
    interpreter.execute(code);

    return output;
}

const specificTests: { [filename: string]: (filepath: string) => void } = {
    ["quine.hodor"]: filepath => {
        test(`${filepath} should be a quine`, t => {
            const code = fs.readFileSync(filepath, "utf8");
            t.is(executeAndGetOutput(code), code);
        });
    }
}

glob.sync(packageDir + "/test/**/*.hodor").forEach(filepath => {
    test("Hodor script should not throw for file " + filepath, t => {
        t.notThrows(() => executeAndGetOutput(fs.readFileSync(filepath, "utf8")));
    });

    const filename = filepath.split("/").slice(-1)[0];
    const specificTest = specificTests[filename];
    specificTest && specificTest(filepath);
});


