import test from 'ava'
import Environment from "../hodor/Environment";

const env = new Environment();

test("Undefined variable get", t => {
    t.throws(() => env.get("invalidvariable"));
});
