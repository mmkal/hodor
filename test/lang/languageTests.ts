import test from "../great-ape";
import fs = require("fs");
import Environment from "../../lang/Environment";
import Interpreter from "../../lang/Interpreter";

test("Hodor script should not throw", t => {
    const code = fs.readFileSync("test/lang/hodor.hodor", "utf8");
    const interpreter = new Environment().withConsoleLogger().createInterpreter();
    t.doesNotThrow(() => interpreter.execute(code));
});