import Hodor from "./Hodor";
import path = require("path");
import fs = require("fs");
import decamelize = require("decamelize");

export module Samples {
    export function quine() {
        const wylis = `
$f = $prop($String, "fromCharCode");
$s = $f(64) + $f(34);
$e = $f(34) + $f(64);
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

    export function fileIOQuine() {
        return Hodor.n00b(`
$argv = $prop($process, "argv");
$sliced = $call($argv, "slice", 0-1);
$filename = $prop($sliced, 0);
$fs = $require("fs");
$rfs = $prop($fs, "readFileSync");
$content = $rfs($filename, "utf8");
$print($content);
`);
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