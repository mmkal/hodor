import Hodor from "./Hodor";
import path = require("path");
import fs = require("fs");
import decamelize = require("decamelize");

export module Samples {
    export function quine() {
        const wylis = `
$s = $fromCharCode(64) + $fromCharCode(34);
$e = $fromCharCode(34) + $fromCharCode(64);
$print("$c = "+$s+$hodor($c)+$e+";$eval($c);")
`;
        const hodor = Hodor.n00b(wylis);
        const literal = Hodor.Hodor(hodor);

        const quine = Hodor.n00b(`$c = @"`) + literal + Hodor.n00b(`"@;$eval($c);`);

        return quine;
    }

    export function helloWorld() {
        return Hodor.n00b(`$print("Hello, World!");`);
    }

    const _samples: any = Samples;
    export const All: (() => string)[] = Object.keys(Samples).map(k => _samples[k]);

    export function writeAllToDisk(dir = "samples") {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        All.forEach(func => {
            const filePath = path.join(dir, decamelize(func.name, "-") + ".hodor");
            fs.writeFileSync(filePath, func(), { encoding: "utf8" });
        });
    }
}

export default Samples;

if (require.main === module) {
    Samples.writeAllToDisk();
}