import {test, packageDir} from "../_ava-shim";
import Environment from "../../lang/Environment";
import Samples from "../../lang/Samples";
import fs = require("fs");

function executeAndGetOutput(code: string, modifyEnvironment: (env: Environment) => void = null) {
    const output = new Array<string>();

    const environment = Environment.createStandard();
    modifyEnvironment && modifyEnvironment(environment);
    const interpreter = environment.createInterpreter();
    interpreter.env.def("print", (message: string) => output.push(message));
    interpreter.execute(code);

    return output.join("\r\n");
}

test(Samples.helloWorld.name + " sample", t => {
    t.is(executeAndGetOutput(Samples.helloWorld()), "Hello, World!");
});

test(Samples.quine.name + " sample", t => {
    const quine = Samples.quine();
    const output = executeAndGetOutput(quine);
    t.is(output, quine);
});

test(Samples.fileIOQuine + " sample", t => {
    // This would be a quine if it were a file, but it relies on process.argv which is different when
    // not invoking it from cli. So cheat by redefining __hodorfile to be __filename.
    const output = executeAndGetOutput(
        Samples.fileIOQuine(), 
        env => env.def("__hodorfile", __filename)
        );
    t.is(output, fs.readFileSync(__filename, "utf8"));
});