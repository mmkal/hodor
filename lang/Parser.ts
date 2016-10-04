import Symbols from "./Symbols"
import TokenStream from "./TokenStream"

export default class Parser {
    private FALSE : Token = { type: Symbols.Tokens.Boolean, value: false };
    private PRECEDENCE: { [key: string]: number } = {
        [Symbols.Operators.Assign]: 1,
        [Symbols.Operators.Or]: 2,
        [Symbols.Operators.And]: 3,
        
        [Symbols.Operators.LessThan]: 7,
        [Symbols.Operators.GreaterThan]: 7,
        [Symbols.Operators.Leq]: 7,
        [Symbols.Operators.Geq]: 7,
        [Symbols.Operators.EqualTo]: 7,
        [Symbols.Operators.NotEqualTo]: 7,
        
        [Symbols.Operators.Plus]: 10,
        [Symbols.Operators.Minus]: 10,

        [Symbols.Operators.Multiply]: 20,
        [Symbols.Operators.Divide]: 20,
        [Symbols.Operators.Modulo]: 20
    };

    constructor(public input: TokenStream) {
    }

    parse() {
        const prog = new Array<Token>();
        while (!this.input.eof()) {
            prog.push(this.parseExpression());
            if (!this.input.eof()) {
                this.skipPunc(Symbols.Punctuation.EndExpression);
            }
        }
        return { type: Symbols.Tokens.Program, prog: prog };
    }

    private isPunc(ch: string) {
        const tok = this.input.peek();
        return tok && tok.type == Symbols.Tokens.Punctuation && (!ch || tok.value == ch) && tok;
    }
    private isKw(kw: string) {
        const tok = this.input.peek();
        return tok && tok.type == Symbols.Tokens.Keyword && (!kw || tok.value == kw) && tok;
    }
    private isOp(op?: string) {
        const tok = this.input.peek();
        return tok && tok.type == Symbols.Tokens.Operator && (!op || tok.value == op) && tok;
    }
    private skipPunc(ch: string) {
        if (this.isPunc(ch)) this.input.next();
        else this.input.fail("Expecting punctuation: \"" + ch + "\"");
    }
    private skipKw(kw: string) {
        if (this.isKw(kw)) this.input.next();
        else this.input.fail("Expecting keyword: \"" + kw + "\"");
    }
    private unexpected(tok?: Token) {
        this.input.fail("Unexpected token: " + JSON.stringify(tok || this.input.peek()));
    }
    private maybeBinary(left: Token, precedence: number): Token {
        const tok = this.isOp();
        if (tok) {
            const tokenPrecedence = this.PRECEDENCE[tok.value];
            if (tokenPrecedence > precedence) {
                this.input.next();
                return this.maybeBinary({
                    type: tok.value === Symbols.Operators.Assign ? Symbols.Tokens.Assign : Symbols.Tokens.Binary,
                    operator: tok.value,
                    left: left,
                    right: this.maybeBinary(this.parseAtom(), tokenPrecedence)
                }, precedence);
            }
        }
        return left;
    }
    private delimited(start: string, stop: string, separator: string, parser: () => Token) {
        const tokens = new Array<Token>();
        let first = true;
        this.skipPunc(start);

        while (!this.input.eof()) {
            if (this.isPunc(stop)) break;
            if (first) {
                first = false;
            }
            else {
                this.skipPunc(separator);
            }
            if (this.isPunc(stop)) break;

            tokens.push(parser());
        }
        this.skipPunc(stop);
        return tokens;
    }
    private parseCall(func: Token): Token {
        return {
            type: Symbols.Tokens.Call,
            func: func,
            args: this.delimited(
                Symbols.Punctuation.OpenParen, 
                Symbols.Punctuation.CloseParen, 
                Symbols.Punctuation.Comma, 
                () => this.parseExpression())
        };
    }
    private parseVarName() {
        const name = this.input.next();
        if (name.type !== Symbols.Tokens.Variable) this.input.fail("Expecting variable name, got " + JSON.stringify(name));
        return name.value;
    }
    private parseIf() {
        this.skipKw(Symbols.Keywords.If);
        const cond = this.parseExpression();
        if (!this.isPunc(Symbols.Punctuation.OpenBlock)) {
            this.skipKw(Symbols.Keywords.Then);
        }
        const then = this.parseExpression();
        const token: Token = {
            type: Symbols.Tokens.If,
            cond: cond,
            then: then
        };
        if (this.isKw(Symbols.Keywords.Else)) {
            this.input.next();
            token.else = this.parseExpression();
        }
        return token;
    }
    private parseLambda(): Token {
        return {
            type: Symbols.Tokens.Lambda,
            vars: this.delimited(
                Symbols.Punctuation.OpenParen, 
                Symbols.Punctuation.CloseParen, 
                Symbols.Punctuation.Comma, 
                () => this.parseVarName()),
            body: this.parseExpression()
        }
    }
    private parseBool(): Token {
        return {
            type: Symbols.Tokens.Boolean,
            value: this.input.next().value === Symbols.Keywords.True
        };
    }

    private parseProg(): Token {
        const prog = this.delimited(
            Symbols.Punctuation.OpenBlock,
            Symbols.Punctuation.CloseBlock,
            Symbols.Punctuation.EndExpression,
            () => this.parseExpression());

        if (prog.length === 0) return this.FALSE;
        if (prog.length === 1) return prog[0];
        return { type: Symbols.Tokens.Program, prog: prog };
    }

    private parseAtom() {
        return this.maybeCall(() => {
            if (this.isPunc(Symbols.Punctuation.OpenParen)) {
                this.input.next();
                const expr = this.parseExpression();
                this.skipPunc(Symbols.Punctuation.CloseParen);
                return expr;
            }
            
            if (this.isPunc(Symbols.Punctuation.OpenBlock)) return this.parseProg();
            if (this.isKw(Symbols.Keywords.If)) return this.parseIf();
            if (this.isKw(Symbols.Keywords.True) || this.isKw(Symbols.Keywords.False)) return this.parseBool();
            if (this.isKw(Symbols.Keywords.Lambda)) {
                this.input.next();
                return this.parseLambda();
            }

            const tok = this.input.next();

            if (tok.type === Symbols.Tokens.Variable || tok.type === Symbols.Tokens.Number || tok.type === Symbols.Tokens.String) {
                return tok;
            }

            this.unexpected(tok);
        });
    }
    private maybeCall(expr: () => Token) {
        const val = expr();
        return this.isPunc(Symbols.Punctuation.OpenParen) ? this.parseCall(val): val;
    }
    private parseExpression(): Token {
        return this.maybeCall(() => this.maybeBinary(this.parseAtom(), 0));
    }
}