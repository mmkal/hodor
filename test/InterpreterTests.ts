import test from 'ava'
import Interpreter from "../hodor/Interpreter";
import Environment from "../hodor/Environment";

const int = new Interpreter(new Environment());

test('number', t => t.is(1, int.primitive(1, "number")));
test('boolean', t => t.is(true, int.primitive(true, "boolean")));
test('string', t => void t.throws(() => int.primitive(1, "string")));
test('boolean from number', t => void t.throws(() => int.primitive(1, "boolean")));
test('number from string', t => void t.throws(() => int.primitive("hi, world!", "number")));

test('invalid op', t => void t.throws(() => int.applyOp("invalidop", 1, 2)));

test('invalid token', t => void t.throws(() => int.evaluate({ type: "invalidtoken" } as any)));
