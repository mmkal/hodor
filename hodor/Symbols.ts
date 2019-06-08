export module Symbols {
    export abstract class SymbolSet {
        private _values: Set<string>;
        public get values() {
            if (!this._values) {
                const _this: any = this;
                this._values = new Set<string>(Object.keys(this).map(k => _this[k]).filter(v => typeof v === "string"));
            }
            return this._values;
        }
    }

    export class Keywords extends SymbolSet {
        If = "Hodor?";
        Then = "Hodor!";
        Else = "Hodor!!";
        Lambda = "Hodor";
        True = "HODOR";
        False = "hodor";
    }

    export class Operators extends SymbolSet {
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

    export class Punctuation extends SymbolSet {
        OpenBlock = "{";
        CloseBlock = "}";
        OpenBrace = "[";
        CloseBrace = "]";
        OpenParen = "(";
        CloseParen = ")";
        Comma = ",";
        EndExpression = ";";
    };

    export class Delimiters extends SymbolSet {
        Escape = "\\";
        SingleQuote = "'";
        Quote = "\"";
        Dot = ".";
        LiteralQuoteStart = "@\"";
        LiteralQuoteEnd = "\"@";
    }

    export const operators = new Operators();

    export const punctuation = new Punctuation();

    export const keywords = new Keywords();

    export const delimiters = new Delimiters();
}

export default Symbols;