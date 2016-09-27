class TokenStream implements Stream<Token> {
    private current: Token = null;
    private keywords = new Set("if then else lambda λ true false".split(" "));
    private escapeChar = "\\";
    private quoteMark = "\"";
    private dot = ".";

    constructor(public input: InputStream) {
    }

    private isKeyword(word: string) {
        return this.keywords.has(word);
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
        return "+-*/%=&|<>!".indexOf(ch) >= 0;
    }
    private isPunc(ch: string) {
        return ",;(){}[]".indexOf(ch) >= 0;
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
    private readNumber() {
        let hasDot = false;
        const number = this.readWhile(ch => {
            if (ch === this.dot) {
                if (hasDot) return false;
                hasDot = true;
                return true;
            }
            return this.isDigit(ch);
        });
    return { type: "num", value: parseFloat(number).toString() };
    }
    private readIdent(): Token {
        const id = this.readWhile(ch => this.isId(ch));
        return {
            type: this.isKeyword(id) ? "kw" : "var",
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
            else if (ch === this.escapeChar) {
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
            type: "str",
            value: this.readEscaped(this.quoteMark)
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

        if (ch === this.quoteMark) return this.readString();
        if (this.isDigit(ch)) return this.readNumber();
        if (this.isIdStart(ch)) return this.readIdent();
        if (this.isPunc(ch)) return { type: "punc", value: this.input.next() };
        if (this.isOpChar(ch)) return { type: "op", value: this.readWhile(ch => this.isOpChar(ch)) };

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