import {test, packageDir} from "../_ava-shim";
import Environment from "../../lang/Environment";
import Samples from "../../lang/Samples";

function executeAndGetOutput(code: string) {
    const output = new Array<string>();

    const interpreter = Environment.createStandard().createInterpreter();
    interpreter.env.def("print", (message: string) => output.push(message));
    interpreter.execute(code);

    return output.join("\r\n");
}

test(Samples.helloWorld.name + " sample", t => {
    t.is(executeAndGetOutput(Samples.helloWorld()), "Hello, World!");
});

test(Samples.quine.name + " sample", t => {``
    const quine = Samples.quine();
    const output = executeAndGetOutput(quine);
    t.is(output, quine);
});