abstract class SymbolSet {
    abstract tokenType(): string;

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
    tokenType() { return Symbols.Tokens.Keyword; }

    If = "if";
    Then = "then";
    Else = "else";
    Lambda = "lambda";
    True = "true";
    False = "false";
}

class Operators extends SymbolSet {
    tokenType() { return Symbols.Tokens.Operator; }

    Assign = "=";
    Or = "||";
    And = "&&";
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

    get characters() {
        // TODO remove. I don't like relying on the first character to identify an operator.
        return new Set([...this.values.values()].map(v => v.charAt(0)));
    }
}

class Punctuation extends SymbolSet {
    tokenType() { return Symbols.Tokens.Punctuation; }

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
    tokenType(): string { throw new Error("No \"delimiter\" token type"); }

    Escape = "\\";
    Quote = "\"";
    Dot = ".";
}

class Tokens extends SymbolSet {
    tokenType(): string { throw new Error("No \"token\" token type"); }

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