import test from "ava";
import fs = require("fs");
import Environment from "../../lang/Environment";
import Interpreter from "../../lang/Interpreter";
import glob = require("glob");
import {packageDir} from "../_ava-meta";

test.todo("Multi-line string literals", null);

test.todo("Quine", null);

test.todo("Check out pify", null);

glob.sync(packageDir + "/test/**/*.hodor").forEach(filename => {
    test("Hodor script should not throw for file " + filename, t => {
        const code = fs.readFileSync(filename, "utf8");
        const interpreter = new Environment().withConsoleLogger().createInterpreter();
        t.notThrows(() => interpreter.execute(code));
    });
});

test("hi", t => {
    t.pass("hi");
});

test("bye", t => {
    t.fail("bye");
});