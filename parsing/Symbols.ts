export default class Symbols {
    static Operators = {
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

    static Punctuation = {
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

    static Keywords = {
        If: "if",
        Then: "then",
        Else: "else",
        Lambda: "lambda",
        True: "true",
        False: "false",

        values: new Set<string>()
    };

    static Delimiters = {
        Escape: "\\",
        Quote: "\"",
        Dot: ".",

        values: new Set<string>()
    }

    static Tokens = {
        Number: "num",
        Boolean: "bool",
        Keyword: "kw",
        Variable: "var",
        String: "str",
        Punctuation: "punc",
        Operator: "op",
        Assign: "assign",
        Binary: "binary",
        Call: "call",
        If: "if",
        Lambda: "lambda",
        Program: "prog",

        values: new Set<string>()
    }
}

Object
    .keys(Symbols)
    .map(k => {
        const symbols: any = Symbols;
        return symbols[k];
    })
    .filter(value => value.hasOwnProperty("values"))
    .forEach((symbolClass) => {
        const values: string[] = Object
            .keys(symbolClass)
            .map(k => symbolClass[k])
            .filter(v => typeof v === "string");
        
        symbolClass.values = new Set(values);
        symbolClass.characters = new Set(values.map(v => v.charAt(0)));
    });