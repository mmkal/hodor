abstract class SymbolSet {
    private _values: Set<string>;
    public get values() {
        if (!this._values) {
            const _this: any = this;
            this._values = new Set<string>(Object.keys(this).map(k => _this[k]).filter(v => typeof v === "string"));
        }
        return this._values;
    }
}

class Keywords extends SymbolSet {
    If = "Hodor?";
    Then = "Hodor!";
    Else = "Hodor!!";
    Lambda = "Hodor";
    True = "HODOR";
    False = "hodor";
}

class Operators extends SymbolSet {
    Assign = "=";
    Or = "Hod-or";
    And = "Ho-dor";
    LessThan = "<";
    GreaterThan = ">";
    Leq = "<=";
    Geq = ">=";
    EqualTo = "==";
    NotEqualTo = "!=";
    Plus = "+";
    Minus = "-";
    Multiply = "*";
    Divide = "/";
    Modulo = "%";

    get identifyingCharacters() {
        // Consider removing. I don't like relying on the first character to identify an operator.
        return new Set([...this.values.values()].map(v => v.charAt(0)).filter(c => /[^a-z]/.test(c)));
    }
}

class Punctuation extends SymbolSet {
    OpenBlock = "{";
    CloseBlock = "}";
    OpenBrace = "[";
    CloseBrace = "]";
    OpenParen = "(";
    CloseParen = ")";
    Comma = ",";
    EndExpression = ";";
};

class Delimiters extends SymbolSet {
    Escape = "\\";
    Quote = "\"";
    Dot = ".";
}

class Tokens extends SymbolSet {
    Number = "num";
    Boolean = "bool";
    Keyword = "kw";
    Variable = "var";
    String = "str";
    Punctuation = "punc";
    Operator = "op";
    Assign = "assign";
    Binary = "binary";
    Call = "call";
    If = "if";
    Lambda = "lambda";
    Program = "prog";
}

export default class Symbols {
    static Operators = new Operators();

    static Punctuation = new Punctuation();

    static Keywords = new Keywords();

    static Delimiters = new Delimiters();

    static Tokens = new Tokens();

    static get sets(): SymbolSet[] {
        const symbols: any = Symbols;
        if (!symbols._sets) {
            symbols._sets = Object
                .keys(symbols)
                .map(k => symbols[k])
                .filter(v => v.hasOwnProperty("values")); 
        }
        return symbols._sets;
    }
}