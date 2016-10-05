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
        return Symbols.operators.identifyingCharacters.has(ch);
    }
    private isPunc(ch: string) {
        return Symbols.punctuation.values.has(ch);
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
            if (ch === Symbols.delimiters.Dot) {
                if (hasDot) return false;
                hasDot = true;
                return true;
            }
            return this.isDigit(ch);
        });
        return { type: Symbols.tokens.Number, value: parseFloat(number).toString() };
    }
    private readIdent(): Token {
        const id = this.readWhile(ch => this.isId(ch));
        // TODO: tidy this up. readIdent() doesn't have that much value right now.
        // const type
        //     = Symbols.keywords.values.has(id)   ? Symbols.tokens.Keyword
        //     : Symbols.operators.values.has(id)  ? Symbols.tokens.Operator
        //                                         : Symbols.tokens.Variable;
        const type = Symbols.keywords.values.has(id) ? Symbols.tokens.Keyword : Symbols.tokens.Operator;
        return {
            type: type,
            value: id
        };
    }

    private readVariableName(): Token {
        const hodorValue = this.readEscaped(Symbols.delimiters.SingleQuote);
        const wylisValue = Hodor.Wylis(hodorValue);
        return {
            type: Symbols.tokens.Variable,
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
            else if (ch === Symbols.delimiters.Escape) {
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
            type: Symbols.tokens.String,
            value: this.readEscaped(Symbols.delimiters.Quote)
        };
    }

    private readLiteral(): Token {
        this.movePast(Symbols.delimiters.LiteralQuoteStart);
        const value = this.readUntil(Symbols.delimiters.LiteralQuoteEnd);
        this.movePast(Symbols.delimiters.LiteralQuoteEnd);

        return {
            type: Symbols.tokens.String,
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

        if (this.isAboutToSee(Symbols.delimiters.LiteralQuoteStart)) return this.readLiteral();
        if (ch === Symbols.delimiters.SingleQuote) return this.readVariableName();
        if (ch === Symbols.delimiters.Quote) return this.readString();
        if (this.isDigit(ch)) return this.readNumber();
        if (this.isIdStart(ch)) return this.readIdent();
        if (this.isPunc(ch)) return { type: Symbols.tokens.Punctuation, value: this.input.next() };
        if (this.isOpChar(ch)) return { type: Symbols.tokens.Operator, value: this.readWhile(ch => this.isOpChar(ch)) };

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