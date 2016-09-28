export module Transpiler {
    enum MorseUnit {
        Dot,
        Dash
    }

    const _hodors = BuildHodors();
    const _nodors = BuildNodors();
    const _nodorKeys = Object.keys(_nodors).sort((k1, k2) => k2.length - k1.length);

    const _beforeHodor = "Ho-dor? ";
    const _afterHodor = " Ho-dor!";

    export function Hodor(wylis: string) {
        const hodors = new Array<string>();
        let lastWasHodor = false;
        let lastHodor: string = null;

        [...wylis].forEach(ch => {
            const hodor = _hodors[ch];
            if (hodor) {
                if (lastWasHodor) {
                    hodors.push(" ");
                }
                else if (lastHodor === " ") {
                    hodors.push(_beforeHodor);
                }
                hodors.push(hodor);
            }
            else {
                if (lastWasHodor) {
                    hodors.push(_afterHodor);
                }
                hodors.push(ch);
            }

            lastWasHodor = !!hodor;
            lastHodor = ch;
        });

        return hodors.join("");
    }

    function escapeRegExp(str: string) {
       return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    export function Wylis(hodor: string) {
        const splitRegex = `(${escapeRegExp(_beforeHodor)})|(${escapeRegExp(_afterHodor)})`;
        return hodor
            .split(new RegExp(splitRegex))
            .filter(hodorToken => typeof hodorToken !== "undefined" && hodorToken !== _beforeHodor && hodorToken !== _afterHodor)
            .map(hodorToken => {
                const replacements = getWylisReplacements(hodorToken);

                Object.keys(replacements)
                    .map(k => JSON.parse(k))
                    .sort((left, right) => right[0] - left[0])
                    .forEach(tuple => {
                        const before = hodorToken.substring(0, tuple[0]);
                        const after = hodorToken.substring(tuple[1]);

                        hodorToken = before + replacements[JSON.stringify(tuple)] + after;
                    });

                return hodorToken;
            })
            .join("");
    }

    function getWylisReplacements(hodorToken: string) {
        const replacements: { [key: string]: string } = {};
        _nodorKeys
            .forEach(nodor => {
                const nodorRegex = new RegExp(escapeRegExp(nodor), "gm");
                const indexes = new Array<number>(); 
                
                let match: RegExpExecArray;
                while ((match = nodorRegex.exec(hodorToken)) !== null) {
                    indexes.push(match.index);
                }

                indexes.forEach(index => {
                    const overlapping = Object
                        .keys(replacements)
                        .map(k => JSON.parse(k))
                        .some((tuple: number[]) => index >= tuple[0] && index < tuple[1]);
                    
                    if (overlapping) return;

                    const key = JSON.stringify([index, index + nodor.length]);
                    replacements[key] = _nodors[nodor];
                });
            });

        return replacements;
    }

    function ParseMorseUnit(symbol: string) {
        if (symbol === ".") {
            return MorseUnit.Dot;
        }
        else if (symbol === "-") {
            return MorseUnit.Dash;
        }
        else {
            throw new Error("Only . or - can be parsed as a morse unit.");
        }
    }

    function HodoriseMorseUnits(units: MorseUnit[]) {
        const hodors = units.map(unit => unit === MorseUnit.Dot ? "Hodor" : "Hodor,");
        let hodor = hodors.join(" ");
        const last = hodor[hodor.length - 1];
        if (last === "r") {
            hodor += ".";
        }
        else if (last === ",") {
            const punctuation = hodors.length % 2 === 0 ? "?" : "!";
            hodor = hodor.substring(0, hodor.length - 1) + punctuation;
        }
        else {
            throw new Error("Hodor?");
        }
        return hodor;
    }

    function BuildHodors() {
        const hodors: { [key: string]: string } = {
            a: ".-",
            b: "-...",
            c: "-.-.",
            d: "-..",
            e: ".",
            f: "..-.",
            g: "--.",
            h: "....",
            i: "..",
            j: ".---",
            k: "-.-",
            l: ".-..",
            m: "--",
            n: "-.",
            o: "---",
            p: ".--.",
            q: "--.-",
            r: ".-.",
            s: "...",
            t: "-",
            u: "..-",
            v: "...-",
            w: ".--",
            x: "-..-",
            y: "-.--",
            z: "--.."
        };
        Object.keys(hodors).forEach(k => {
            const morse = hodors[k];
            const units = [...morse].map(ParseMorseUnit);
            const hodor = HodoriseMorseUnits(units);
            hodors[k] = hodor;
            hodors[k.toUpperCase()] = hodor.toUpperCase();
        });

        return hodors;
    }

    function BuildNodors() {
        const nodors: { [key: string]: string } = {};
        Object.keys(_hodors).forEach(k => {
            const key = _hodors[k];
            const value = k;
            nodors[key] = value;
            nodors[" " + key] = value;
        });
        return nodors;
    }
}