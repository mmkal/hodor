import Hodor from "./Hodor";

export module Samples {
    export function Quine() {
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

    export function HelloWorld() {
        return Hodor.n00b(`$print("Hello, World!");`);
    }

    const _samples: any = Samples;
    export const All: (() => string)[] = Object.keys(Samples).map(k => _samples[k]);
}

export default Samples;