import test from "../_ava-shim";
import Interpreter from "../../lang/Interpreter";
import Environment from "../../lang/Environment";

const int = new Interpreter(new Environment());

// test(Interpreter.prototype.primitive.name, t => {
//     t.is(1, int.primitive(1, "number"));
//     t.is(true, int.primitive(true, "boolean"));
//     t.throws
// });

test(t => t.is(1, int.primitive(1, "number")));
test(t => t.is(true, int.primitive(true, "boolean")));
test(t => t.throws(() => int.primitive(1, "string")));
test(t => t.throws(() => int.primitive(1, "boolean")));
test(t => t.throws(() => int.primitive("hi, world!", "number")));
test(t => t.throws(() => int.primitive(1, "boolean")));

test(t => t.throws(() => int.applyOp("invalidop", 1, 2)));

test(t => t.throws(() => int.evaluate({ type: "invalidtoken" })));

