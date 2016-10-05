import {test, packageDir} from "../_ava-shim";
import Environment from "../../lang/Environment";
import Samples from "../../lang/Samples";
import Hodor from "../../lang/Hodor";
import fs = require("fs");
import decamelize = require("decamelize");

class TestThing{
    constructor(private name: string) {
    }
    getGreeting(day: string) {
        return "Hi I'm " + this.name + " and it's " + day;
    }
}

function executeAndGetOutput(code: string) {
    const output = new Array<string>();

    // Create environment with a few extra definitions to play around with
    const interpreter = Environment.createStandard()
        .withKVs({
            __hodorfile: __filename,
            complexObject: { value: 123 },
            TestThing: TestThing,
            print: (message: string) => output.push(message)
        })
        .createInterpreter();
    
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

test(Samples.fileIOQuine.name + " sample", t => {
    // This would be a quine if it were a file, but it relies on process.argv which is different when
    // not invoking it from cli. So cheat by redefining __hodorfile to be __filename.
    const output = executeAndGetOutput(Samples.fileIOQuine());
    t.is(output, fs.readFileSync(__filename, "utf8"));
});

test(Samples.helloWorldLambda.name + " sample", t => {
    t.is(executeAndGetOutput(Samples.helloWorldLambda()), "Hello, World!");
});

const validScriptTests: { [name: string]: string } = {
    numberOperators: "$num = 1 + 2 - 3 * 4 / 5 % 6;",
    booleanOperators:  "$val = (1 < 7) Ho-dor (1 > 8) Hod-or (1 <= 9) != (1 >= 10) == (1 <= 11);",
    trueCondition: "Hodor? (1 < 2) Hodor! $print(HODOR) Hodor!! $print(hodor);",
    falseCondition: "Hodor? (1 > 2) Hodor! $print(hodor) Hodor!! $print(HODOR);",
    blockScope: "{} { $x = 123; } { $y = 456; $z = 789; }"
};

Object.keys(validScriptTests).forEach(name => {
    test(decamelize(name) + " script doesn't throw", t => {
        const code = Hodor.n00b(validScriptTests[name]);
        t.notThrows(() => executeAndGetOutput(code));
    });
});

const outputs: { [name: string]: string } = {
    "print:123": "$print(123);",
    "property get:123": `$print($prop($complexObject, "value"));`,
    "property set:456": `$print($prop($complexObject, "otherValue", 456));`,
    "comment ignored:hello": `$print("hello"); # goodbye`,
    "get in lambda:3": `$x = 1; $f = Hodor($y) { $print($x + $y); }; $f(2);`,
    "set in lambda:3":`$f = Hodor($x) { $y = $x + 2; }; $print($f(1));`,
    "construct and call method:Hi I'm bob and it's Monday": `$b = $construct($TestThing, "bob"); $print($call($b, "getGreeting", "Monday"));`,
    "string escaping:\"hi\"": `$print("\"hi\"");`
};

Object.keys(outputs).forEach(info => {
    const [name, message] = info.split(":");
    test(name + " should output " + message, t => {
        const code = Hodor.n00b(outputs[info]);
        t.is(executeAndGetOutput(code), message);
    });
});

const invalidScriptTests: { [name: string]: string } = {
    "bad assignment:Cannot assign to .*bool": "hodor = 1",
    "missing semicolon:Expecting punctuation:.*;": "$print(123) $print(456)",
    "missing then:Expecting keyword": "Hodor? (1 < 2) $print(HODOR) Hodor!! $print(hodor);",
    "undefined variable in scope:Undefined variable": `$f = Hodor($x) { $print($y); }; $f(1);`
};

Object.keys(invalidScriptTests).forEach(info => {
    const[name, errorRegex] = info.split(":");
    test(name + " throws", t => {
        const code = Hodor.n00b(invalidScriptTests[info]);
        t.throws(() => executeAndGetOutput(code), new RegExp(errorRegex));
    });
});

test(Samples.operators.name, t => {
    t.is(executeAndGetOutput(Samples.operators()), "true\r\ntrue");
})

test("Invalid script throws", t => {
    t.throws(() => executeAndGetOutput("hello!"));
});