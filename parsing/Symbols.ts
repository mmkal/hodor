module Symbols {
    function values(symbolClass: { [key: string]: string }) {
        return new Set(Object.keys(symbolClass).map(k => symbolClass[k]));
    }

    export const Operators = {
        Assign: "=",
        Or: "||",
        And: "&&",
        LessThan: "<",
        GreaterThan: ">",
        Leq: "<=",
        Geq: ">=",
        EqualTo: "==",
        NotEqualTo: "!=",
        Plus: "+",
        Minus: "-",
        Multiply: "*",
        Divide: "/",
        Modulo: "%",

        values: new Set<string>(),
        characters: new Set<string>()
    };

    export const Punctuation = {
        OpenBlock: "{",
        CloseBlock: "}",
        OpenBrace: "[",
        CloseBrace: "]",
        OpenParen: "(",
        CloseParen: ")",
        Comma: ",",
        EndExpression: ";",

        values: new Set<string>()
    };

    export const Keywords = {
        If: "if",
        Then: "then",
        Else: "else",
        Lambda: "lambda",
        True: "true",
        False: "false",

        values: new Set<string>()
    };

    export const Delimiters = {
        Escape: "\\",
        Quote: "\"",
        Dot: ".",

        values: new Set<string>()
    }

    const symbolClasses: any[] = [Operators, Punctuation, Keywords];

    symbolClasses.forEach((symbolClass) => {
        const values: string[] = Object
            .keys(symbolClass)
            .map(k => symbolClass[k])
            .filter(v => typeof v === "string");
        symbolClass.values = new Set(values);
        symbolClass.characters = new Set(values.map(v => v.charAt(0)));
    });
}