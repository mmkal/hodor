import * as Hodor from "../hodor/Hodor";
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
    fs.readFileSync(process.cwd() + "/package.json", "utf8")
];

sampleStrings.forEach(original => {
    test("Hodor then Wylis returns original: " + original.split("\n")[0], () => {
        const hodor = Hodor.Hodor(original);
        const wylis = Hodor.Wylis(hodor);
        expect(wylis).toBe(original);
    });
});

sampleStrings.forEach(original => {
    test("Hodor twice then Wylis twice returns original: " + original.split("\n")[0], () => {
        const hodor = Hodor.Hodor(Hodor.Hodor(original));
        const wylis = Hodor.Wylis(Hodor.Wylis(hodor));
        expect(wylis).toBe(original);
    });
});

[
    "e E",
    "et ET",
    "et eT",
    "et Et"
].map(s => s.split(" ")).forEach(cases => {
    test("Hodor is case sensitive: " + cases.join(), () => {
        expect(Hodor.Hodor(cases[0])).not.toBe(Hodor.Hodor(cases[1]));
    });
});

["Hodor. Hello"].forEach(invalidHodor => {
    test("Wylis should fail on invalid Hodor: " + invalidHodor, () => {
        expect(() => Hodor.Wylis(invalidHodor)).toThrow();
    });
});