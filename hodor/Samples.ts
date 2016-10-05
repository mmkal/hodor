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
$fs = $require("fs");
$rfs = $prop($fs, "readFileSync");
$content = $rfs($__hodorfile, "utf8");
$print($content);
`.trim());
    }

    export function helloWorldLambda() {
        return Hodor.n00b(`
$f = Hodor($msg) $msg + ", World!";
$print($f("Hello"));
`.trim());
    }

    export function operators() {
        return Hodor.n00b(`
$num = 1 + 2 - 3 * 4 / 5 % 6;
$val = ($num < 7) Ho-dor ($num > 8) Hod-or ($num <= 9) != ($num >= 10) == ($num <= 11);
Hodor? (1 < 2) Hodor! $print(HODOR) Hodor!! $print(hodor);
Hodor? (1 > 2) Hodor! $print(hodor) Hodor!! $print(HODOR);
`.trim());
    }

    /* istanbul ignore next */
    const _samples: any = Samples;
    /* istanbul ignore next */
    export const All: (() => string)[] = Object.keys(Samples).map(k => _samples[k]);

    /* istanbul ignore next */
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

/* istanbul ignore if */
if (require.main === module) {
    Samples.writeAllToDisk();
}