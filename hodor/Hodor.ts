enum MorseUnit {
  Dot,
  Dash,
}

const _hodors = BuildHodors();
const _nodors = BuildNodors();
const _nodorKeys = Object.keys(_nodors).sort((k1, k2) => k2.length - k1.length);

const _beforeHodor = "Ho-dor? ";
const _afterHodor = " Ho-dor!";
const _numberPrefix = "Hodor...";
const _numberSuffix = "Hodor...";
const _numberInStringPrefix = "Hodor... ";
const _numberInStringSuffix = " ...Hodor";

export function Hodor(wylis: string) {
  // First, handle numbers within strings
  // Match numbers (including negative and decimal numbers)
  const numberPattern = /-?\d+(\.\d+)?/g;
  let processed = wylis;
  const numberMatches: Array<{match: string, index: number}> = [];
  
  let match;
  while ((match = numberPattern.exec(wylis)) !== null) {
    numberMatches.push({ match: match[0], index: match.index });
  }
  
  // Replace numbers from end to start to preserve indices
  for (let i = numberMatches.length - 1; i >= 0; i--) {
    const { match: numStr, index } = numberMatches[i];
    const words = numberToWords(numStr);
    // Insert markers as plain text - they'll be encoded along with everything else
    const replacement = _numberInStringPrefix + words + _numberInStringSuffix;
    processed = processed.substring(0, index) + replacement + processed.substring(index + numStr.length);
  }
  
  // Now process the rest normally (this will encode the markers along with everything else)
  return HodorWithoutNumbers(processed);
}

function HodorWithoutNumbers(wylis: string) {
  return HodorWithoutNumbersHelper(wylis);
}

function HodorWithoutNumbersHelper(wylis: string) {
  const hodors = new Array<string>();
  let lastWasHodor = false;
  let lastHodor: string | null = null;

  wylis.split("").forEach((ch) => {
    const hodor = _hodors[ch];
    if (hodor) {
      if (lastWasHodor) {
        hodors.push(" ");
      } else if (lastHodor === " ") {
        hodors.push(_beforeHodor);
      }
      hodors.push(hodor);
    } else {
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

// Pre-encode the markers so we can use them when decoding
const _encodedNumberInStringPrefix = HodorWithoutNumbersHelper(_numberInStringPrefix);
const _encodedNumberInStringSuffix = HodorWithoutNumbersHelper(_numberInStringSuffix);

function escapeRegExp(str: string) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export function Wylis(hodor: string) {
  // First, handle numbers within strings (encoded markers pattern)
  let processed = hodor;
  const numberInStringPattern = new RegExp(escapeRegExp(_encodedNumberInStringPrefix) + "(.+?)" + escapeRegExp(_encodedNumberInStringSuffix), "g");
  const numberMatches: Array<{match: string, encoded: string, index: number}> = [];
  
  let match;
  while ((match = numberInStringPattern.exec(hodor)) !== null) {
    numberMatches.push({ match: match[0], encoded: match[1], index: match.index });
  }
  
  // Replace numbers from end to start to preserve indices
  for (let i = numberMatches.length - 1; i >= 0; i--) {
    const { match: fullMatch, encoded, index } = numberMatches[i];
    const words = WylisWithoutNumbers(encoded);
    
    // Convert words back to number string
    const wordToDigit: { [key: string]: string } = {
      zero: "0",
      one: "1",
      two: "2",
      three: "3",
      four: "4",
      five: "5",
      six: "6",
      seven: "7",
      eight: "8",
      nine: "9",
    };
    
    const parts = words.split(" ");
    let result = "";
    let foundMinus = false;
    
    for (const part of parts) {
      if (part === "minus") {
        foundMinus = true;
      } else if (part === "point") {
        result += ".";
      } else if (wordToDigit[part.toLowerCase()]) {
        result += wordToDigit[part.toLowerCase()];
      }
    }
    
    const numStr = foundMinus ? "-" + result : result;
    processed = processed.substring(0, index) + numStr + processed.substring(index + fullMatch.length);
  }
  
  // Now process the rest normally
  const wylis = WylisWithoutNumbers(processed);

  if (Hodor(wylis) !== hodor) {
    throw new Error(`String ${hodor} is not correctly hodorised.`);
  }
  return wylis;
}

function WylisWithoutNumbers(hodor: string) {
  const splitRegex = `(${escapeRegExp(_beforeHodor)})|(${escapeRegExp(
    _afterHodor
  )})`;
  const wylis = hodor
    .split(new RegExp(splitRegex))
    .filter(
      (hodorToken) =>
        typeof hodorToken !== "undefined" &&
        hodorToken !== _beforeHodor &&
        hodorToken !== _afterHodor
    )
    .map((hodorToken) => {
      const replacements = getWylisReplacements(hodorToken);

      Object.keys(replacements)
        .map((k) => JSON.parse(k))
        .sort((left, right) => right[0] - left[0])
        .forEach((tuple) => {
          const before = hodorToken.substring(0, tuple[0]);
          const after = hodorToken.substring(tuple[1]);

          hodorToken = before + replacements[JSON.stringify(tuple)] + after;
        });

      return hodorToken;
    })
    .join("");

  return wylis;
}

function getWylisReplacements(hodorToken: string) {
  const replacements: { [key: string]: string } = {};
  _nodorKeys.forEach((nodor) => {
    const nodorRegex = new RegExp(escapeRegExp(nodor), "gm");
    const indexes = new Array<number>();

    let match: RegExpExecArray | null;
    while ((match = nodorRegex.exec(hodorToken)) !== null) {
      indexes.push(match.index);
    }

    indexes.forEach((index) => {
      const overlapping = Object.keys(replacements)
        .map((k) => JSON.parse(k))
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
  } else if (symbol === "-") {
    return MorseUnit.Dash;
  } else {
    /* istanbul ignore next */
    throw new Error(symbol + " cannot be parsed as a morse unit.");
  }
}

function HodoriseMorseUnits(units: MorseUnit[]) {
  return units
    .map((unit, index) => {
      const isDot = unit === MorseUnit.Dot;
      if (index < units.length - 1) {
        return isDot ? "Hodor" : "Hodor,";
      }
      // Now deal with the last unit:
      else if (isDot) {
        return "Hodor.";
      } else if (units.length % 2 === 0) {
        return "Hodor?";
      } else {
        return "Hodor!";
      }
    })
    .join(" ");
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
    z: "--..",
  };
  Object.keys(hodors).forEach((k) => {
    const morse = hodors[k];
    const units = morse.split("").map(ParseMorseUnit);
    const hodor = HodoriseMorseUnits(units);
    hodors[k] = hodor;
    hodors[k.toUpperCase()] = hodor.toUpperCase();
  });

  return hodors;
}

function BuildNodors() {
  const nodors: { [key: string]: string } = {};
  Object.keys(_hodors).forEach((k) => {
    const key = _hodors[k];
    const value = k;
    nodors[key] = value;
    nodors[" " + key] = value;
  });
  return nodors;
}

// Convert a digit to its word representation
function digitToWord(digit: string): string {
  const digitWords: { [key: string]: string } = {
    "0": "zero",
    "1": "one",
    "2": "two",
    "3": "three",
    "4": "four",
    "5": "five",
    "6": "six",
    "7": "seven",
    "8": "eight",
    "9": "nine",
  };
  return digitWords[digit] || digit;
}

// Convert a number string to spelled-out words
function numberToWords(numStr: string): string {
  let result: string[] = [];
  let i = 0;
  
  // Handle negative sign
  if (numStr.startsWith("-")) {
    result.push("minus");
    i = 1;
  }
  
  // Process each character
  while (i < numStr.length) {
    const ch = numStr[i];
    if (ch === ".") {
      result.push("point");
    } else if (/[0-9]/.test(ch)) {
      result.push(digitToWord(ch));
    }
    i++;
  }
  
  return result.join(" ");
}

// Encode a number using morse code
export function HodorNumber(numStr: string): string {
  const words = numberToWords(numStr);
  const encoded = Hodor(words);
  return _numberPrefix + " " + encoded + " " + _numberSuffix;
}

// Decode a number from hodor format
export function WylisNumber(hodor: string): string {
  // Remove prefix and suffix
  if (!hodor.startsWith(_numberPrefix + " ") || !hodor.endsWith(" " + _numberSuffix)) {
    throw new Error(`Number ${hodor} does not have correct format.`);
  }
  
  const withoutPrefix = hodor.substring(_numberPrefix.length + 1);
  const withoutSuffix = withoutPrefix.substring(0, withoutPrefix.length - _numberSuffix.length - 1);
  
  const words = Wylis(withoutSuffix);
  
  // Convert words back to number string
  const wordToDigit: { [key: string]: string } = {
    zero: "0",
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
  };
  
  const parts = words.split(" ");
  let result = "";
  let foundMinus = false;
  
  for (const part of parts) {
    if (part === "minus") {
      foundMinus = true;
    } else if (part === "point") {
      result += ".";
    } else if (wordToDigit[part.toLowerCase()]) {
      result += wordToDigit[part.toLowerCase()];
    }
  }
  
  return foundMinus ? "-" + result : result;
}

