import test from "ava";
import fs = require("fs");
import Environment from "../../lang/Environment";
import Interpreter from "../../lang/Interpreter";
import glob = require("glob");

glob.sync("test/**/*.hodor").forEach(filename => {
    test("Hodor script should not throw for file " + filename, t => {
        const code = fs.readFileSync(filename, "utf8");
        const interpreter = new Environment().withConsoleLogger().createInterpreter();
        t.notThrows(() => interpreter.execute(code));
    });
});