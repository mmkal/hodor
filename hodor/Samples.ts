import * as Hodor from "./Hodor";
import path = require("path");
import fs = require("fs");

const decamelize = (input: string, joiner: string) =>
  input.split(/(?=[A-Z])/).join(joiner);

export module Samples {
  export function quine() {
    const wylis = `
$f = $prop($String, "fromCharCode");
$s = $f(64) + $f(34);
$e = $f(34) + $f(64);
$print("$c = "+$s+$hodor($c)+$e+";$eval($c);")
`;
    const hodor = fromPseudoHodor(wylis);
    const literal = Hodor.Hodor(hodor);

    const quine =
      fromPseudoHodor(`$c = @"`) + literal + fromPseudoHodor(`"@;$eval($c);`);

    return quine;
  }

  export function helloWorld() {
    return fromPseudoHodor(`$print("Hello, World!");`);
  }

  export function fileIOQuine() {
    return fromPseudoHodor(
      `
$fs = $require("fs");
$rfs = $prop($fs, "readFileSync");
$content = $rfs($__hodorfile, "utf8");
$print($content);
`.trim()
    );
  }

  export function helloWorldLambda() {
    return fromPseudoHodor(
      `
$f = Hodor($msg) $msg + ", World!";
$print($f("Hello"));
`.trim()
    );
  }

  export function operators() {
    return fromPseudoHodor(
      `
$num = 1 + 2 - 3 * 4 / 5 % 6;
$val = ($num < 7) Ho-dor ($num > 8) Hod-or ($num <= 9) != ($num >= 10) == ($num <= 11);
Hodor? (1 < 2) Hodor! $print(HODOR) Hodor!! $print(hodor);
Hodor? (1 > 2) Hodor! $print(hodor) Hodor!! $print(HODOR);
`.trim()
    );
  }

  /**
   * If you're still unfamiliar with Hodor, you can use fromPseudoHodor to convert Hodor-style pseudocode into
   * valid Hodor. This will very naively attempt to find quotes and variables (denoted by $someWord). It's
   * dumb and will only work with very simple scripts, while you're learning how to Hodor properly.
   */
  export function fromPseudoHodor(wylis: string) {
    function hodoriseQuotes(code: string) {
      return code.replace(
        /([^@])"(?!@)([^"]+[^@])"(?!@)/g,
        (match, group1, group2) => group1 + `"` + Hodor.Hodor(group2) + `"`
      );
    }
    function hodoriseVariables(code: string) {
      return code.replace(
        /\$(\w+?)\b/g,
        (match, group1) => `'` + Hodor.Hodor(group1) + `'`
      );
    }

    let hodor = hodoriseVariables(wylis);
    hodor = hodoriseQuotes(hodor);

    return hodor;
  }
}

export default Samples;

/* istanbul ignore if */
if (require.main === module) {
  const dir = "samples";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const samples: { [name: string]: Function } = Samples as any;
  Object.keys(samples)
    .map((k) => samples[k])
    .filter((fn) => fn.length === 0)
    .forEach((fn) => {
      const filepath = path.join(dir, decamelize(fn.name, "-") + ".hodor");
      console.log("Writing " + path.resolve(filepath));
      fs.writeFileSync(filepath, fn(), { encoding: "utf8" });
    });
}
