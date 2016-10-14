import test from "./_ava-shim";
import Interpreter from "../hodor/Interpreter";
import Environment from "../hodor/Environment";

const int = new Interpreter(new Environment());

test(t => t.is(1, int.primitive(1, "number")));
test(t => t.is(true, int.primitive(true, "boolean")));
test(t => t.throws(() => int.primitive(1, "string")));
test(t => t.throws(() => int.primitive(1, "boolean")));
test(t => t.throws(() => int.primitive("hi, world!", "number")));
test(t => t.throws(() => int.primitive(1, "boolean")));

test(t => t.throws(() => int.applyOp("invalidop", 1, 2)));

test(t => t.throws(() => int.evaluate({ type: "invalidtoken" })));