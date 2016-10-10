import Hodor from "../Hodor";
import {test,packageDir} from "./_ava-shim";
import fs = require("fs");

const sampleStrings = [
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
];

sampleStrings.forEach(original => {
    test("Hodor then Wylis returns original: " + original.split("\n")[0], t => {
        const hodor = Hodor.Hodor(original);
        const wylis = Hodor.Wylis(hodor);
        t.is(wylis, original);
    });
});

sampleStrings.forEach(original => {
    test("Hodor twice then Wylis twice returns original: " + original.split("\n")[0], t => {
        const hodor = Hodor.Hodor(Hodor.Hodor(original));
        const wylis = Hodor.Wylis(Hodor.Wylis(hodor));
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
        t.not(Hodor.Hodor(cases[0]), Hodor.Hodor(cases[1]));
    });
});

["Hodor. Hello"].forEach(invalidHodor => {
    test("Wylis should fail on invalid Hodor: " + invalidHodor, t => {
        t.throws(() => Hodor.Wylis(invalidHodor));
    });
});