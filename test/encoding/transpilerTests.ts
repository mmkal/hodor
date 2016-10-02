import { Transpiler } from "../../encoding/transpiler";
import test from "ava";
import fs = require("fs");
import {packageDir} from "../_ava-meta";

[
    "e",
    "et",
    "e t",
    "e  t",
    "e  t e",
    "e  t    e",
    "Ho-dor",
    "Hodor.",
    "Hodor!",
    "Hodor?",
    "// It rubs the lotion on its skin, or else it gets the hose again.",
    fs.readFileSync(packageDir + "/package.json", "utf8")
].forEach(original => {
    test("Hodor then Wylis returns original: " + original.split("\n")[0], t => {
        const hodor = Transpiler.Hodor(original);
        const wylis = Transpiler.Wylis(hodor);
        t.is(wylis, original);
    });
});

[
    "e E",
    "et ET",
    "et eT",
    "et Et"
].map(s => s.split(" ")).forEach(cases => {
    test("Hodor is case sensitive: " + cases.join(), t => {
        t.not(Transpiler.Hodor(cases[0]), Transpiler.Hodor(cases[1]));
    });
});

["Hodor. Hello"].forEach(invalidHodor => {
    test("Wylis should fail on invalid Hodor: " + invalidHodor, t => {
        t.throws(() => Transpiler.Wylis(invalidHodor));
    });
});