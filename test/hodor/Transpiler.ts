import { Transpiler } from "../../hodor/transpiler";
import test from "../great-ape";
import fs = require("fs");

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
    "// If the token started with spaces, the spaces may been incorporated by the first Hodorish token.",
    fs.readFileSync("test/hodor/Transpiler.ts", "utf8") // This file!
].forEach(original => {
    test("Hodor then Wylis returns original: " + original.substring(0, (original + "\n").indexOf("\n")), t => {
        const hodor = Transpiler.Hodor(original);
        const wylis = Transpiler.Wylis(hodor);
        t.isEqual(wylis, original);
    });
});

[
    "e E",
    "et ET",
    "et eT",
    "et Et"
].map(s => s.split(" ")).forEach(cases => {
    test("Hodor is case sensitive: " + cases.join(), t => {
        t.isNotEqual(Transpiler.Hodor(cases[0]), Transpiler.Hodor(cases[1]));
    });
});