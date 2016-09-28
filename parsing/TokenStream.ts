import InputStream from "./InputStream"
import Symbols from "./Symbols"

export default class TokenStream implements Stream<Token> {
    private current: Token = null;

    constructor(public input: InputStream) {
    }

    private isKeyword(word: string) {
        return Symbols.Keywords.values.has(word);
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
        return Symbols.Operators.characters.has(ch);
    }
    private isPunc(ch: string) {
        return Symbols.Punctuation.values.has(ch);
    }
    private isWhitespace(ch: string) {
        return " \t\n".indexOf(ch) >= 0;
    }
    private readWhile(predicate: (char: string) => boolean) {
        const chars: string[] = [];
        while (!this.input.eof() && predicate(this.input.peek())) {
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
        return {
            type: this.isKeyword(id) ? Symbols.Tokens.Keyword : Symbols.Tokens.Variable,
            value: id
        };
    }
    private readEscaped(end: string) {
        let escaped = false;
        let chars: string[] = [];
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