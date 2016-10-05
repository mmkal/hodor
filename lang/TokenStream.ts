import InputStream from "./InputStream"
import Symbols from "./Symbols"
import Hodor from "./Hodor";

export default class TokenStream implements Stream<Token> {
    private current: Token = null;

    constructor(public input: InputStream) {
    }

    private isDigit(ch: string) {
        return /[0-9]/i.test(ch);
    }
    private isIdStart(ch: string) {
        return /[a-z_]/i.test(ch);
    }
    private isId(ch: string) {
        return this.isIdStart(ch) || "?!-<>=0123456789".indexOf(ch) >= 0;
    }
    private isOpChar(ch: string) {
        return Symbols.Operators.identifyingCharacters.has(ch);
    }
    private isPunc(ch: string) {
        return Symbols.Punctuation.values.has(ch);
    }
    private isWhitespace(ch: string) {
        return " \r\t\n".indexOf(ch) >= 0;
    }

    private isAboutToSee(str: string) {
        return this.input.peek(str.length) === str;
    }

    private movePast(str: string) {
        [...str].forEach(ch => {
            this.input.next() === ch || this.input.fail("Unexpected character: " + ch);
        });
    }

    private readUntil(str: string) {
        const chars = new Array<string>();
        while (!this.input.eof() && !this.isAboutToSee(str)) {
            chars.push(this.input.next());
        }
        if (!this.isAboutToSee(str)) {
            this.fail(`Expected to find "${str}" but reached end of file.`);
        }
        return chars.join("");
    }

    private readWhile(predicate: (char: string) => boolean, lookAhead?: number) {
        const chars: string[] = [];
        while (!this.input.eof() && predicate(this.input.peek(lookAhead))) {
            chars.push(this.input.next());
        }
        return chars.join("");
    }
    
    private readNumber(): Token {
        let hasDot = false;
        const number = this.readWhile(ch => {
            if (ch === Symbols.Delimiters.Dot) {
                if (hasDot) return false;
                hasDot = true;
                return true;
            }
            return this.isDigit(ch);
        });
        return { type: Symbols.Tokens.Number, value: parseFloat(number).toString() };
    }
    private readIdent(): Token {
        const id = this.readWhile(ch => this.isId(ch));
        // TODO: tidy this up. readIdent() doesn't have that much value right now.
        // const type
        //     = Symbols.Keywords.values.has(id)   ? Symbols.Tokens.Keyword
        //     : Symbols.Operators.values.has(id)  ? Symbols.Tokens.Operator
        //                                         : Symbols.Tokens.Variable;
        const type = Symbols.Keywords.values.has(id) ? Symbols.Tokens.Keyword : Symbols.Tokens.Operator;
        return {
            type: type,
            value: id
        };
    }

    private readVariableName(): Token {
        const hodorValue = this.readEscaped(Symbols.Delimiters.SingleQuote);
        const wylisValue = Hodor.Wylis(hodorValue);
        return {
            type: Symbols.Tokens.Variable,
            value: wylisValue
        };
    }

    private readEscaped(end: string) {
        let escaped = false;
        let chars: string[] = [];
        this.input.next();
        while (!this.input.eof()) {
            const ch = this.input.next();
            if (escaped) {
                chars.push(ch);
                escaped = false;
            }
            else if (ch === Symbols.Delimiters.Escape) {
                escaped = true;
            }
            else if (ch === end) {
                break;
            }
            else {
                chars.push(ch);
            }
        }
        return chars.join("");
    }
    private readString(): Token {
        return {
            type: Symbols.Tokens.String,
            value: this.readEscaped(Symbols.Delimiters.Quote)
        };
    }

    private readLiteral(): Token {
        this.movePast(Symbols.Delimiters.LiteralQuoteStart);
        const value = this.readUntil(Symbols.Delimiters.LiteralQuoteEnd);
        this.movePast(Symbols.Delimiters.LiteralQuoteEnd);

        return {
            type: Symbols.Tokens.String,
            value: value
        };
    }

    private skipComment() {
        this.readWhile(ch => ch !== "\n");
        this.input.next();
    }
    private readNext(): Token {
        this.readWhile(ch => this.isWhitespace(ch));
        if (this.input.eof()) return null;

        let ch = this.input.peek();
        if (ch === "#") {
            this.skipComment();
            return this.readNext();
        }

        if (this.isAboutToSee(Symbols.Delimiters.LiteralQuoteStart)) return this.readLiteral();
        if (ch === Symbols.Delimiters.SingleQuote) return this.readVariableName();
        if (ch === Symbols.Delimiters.Quote) return this.readString();
        if (this.isDigit(ch)) return this.readNumber();
        if (this.isIdStart(ch)) return this.readIdent();
        if (this.isPunc(ch)) return { type: Symbols.Tokens.Punctuation, value: this.input.next() };
        if (this.isOpChar(ch)) return { type: Symbols.Tokens.Operator, value: this.readWhile(ch => this.isOpChar(ch)) };

        this.input.fail("Unexpected character: "  + ch);
    }
    public peek() {
        return this.current || (this.current = this.readNext());
    }
    public next() {
        const token = this.current;
        this.current = null;
        return token || this.readNext();
    }
    public eof() {
        return this.peek() === null;
    }
    public fail(message: any) {
        this.input.fail(message);
    }
}