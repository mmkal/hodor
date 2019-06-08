import Interpreter from "../hodor/Interpreter";
import Environment from "../hodor/Environment";

const int = new Interpreter(new Environment());

test('number', () => expect(1).toBe(int.primitive(1, "number")));
test('boolean', () => expect(true).toBe(int.primitive(true, "boolean")));
test('string', () => void expect(() => int.primitive(1, "string")).toThrow());
test('boolean from number', () => void expect(() => int.primitive(1, "boolean")).toThrow());
test('number from string', () => void expect(() => int.primitive("hi, world!", "number")).toThrow());

test('invalid op', () => void expect(() => int.applyOp("invalidop", 1, 2)).toThrow());

test('invalid token', () => void expect(() => int.evaluate({ type: "invalidtoken" } as any)).toThrow());
