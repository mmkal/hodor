import test from "../_ava-shim";
import Environment from "../../hodor/Environment";

const env = new Environment();

test("Undefined variable get", t => {
    t.throws(() => env.get("invalidvariable"));
});