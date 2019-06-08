import Symbols from "./Symbols"
import TokenStream from "./TokenStream"
import {Token, types} from './Token'

export default class Parser {
    private PRECEDENCE: { [key: string]: number } = {
        [Symbols.operators.Assign]: 1,
        [Symbols.operators.Or]: 2,
        [Symbols.operators.And]: 3,
        
        [Symbols.operators.LessThan]: 7,
        [Symbols.operators.GreaterThan]: 7,
        [Symbols.operators.Leq]: 7,
        [Symbols.operators.Geq]: 7,
        [Symbols.operators.EqualTo]: 7,
        [Symbols.operators.NotEqualTo]: 7,
        
        [Symbols.operators.Plus]: 10,
        [Symbols.operators.Minus]: 10,

        [Symbols.operators.Multiply]: 20,
        [Symbols.operators.Divide]: 20,
        [Symbols.operators.Modulo]: 20
    };

    constructor(public input: TokenStream) {
    }

    parse(): Token {
        const prog = new Array<Token>();
        while (!this.input.eof()) {
            const expression = this.parseExpression();
            prog.push(expression);
            if (!this.input.eof() && expression.type !== Symbols.tokens.Program) {
                this.skipPunc(Symbols.punctuation.EndExpression);
            }
        }
        return { type: types.Program, prog: prog };
    }

    private isPunc(ch: string) {
        const tok = this.input.peek();
        return tok && tok.type == types.Punctuation && (!ch || tok.value == ch) && tok;
    }
    private isKw(kw: string) {
        const tok = this.input.peek();
        return tok && tok.type == types.Keyword && (!kw || tok.value == kw) && tok;
    }
    private isOp(op?: string) {
        const tok = this.input.peek();
        return tok && tok.type == types.Operator && (!op || tok.value == op) && tok;
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
                    type: tok.value === Symbols.operators.Assign ? types.Assign : types.Binary as any,
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
            type: types.Call,
            func: func,
            args: this.delimited(
                Symbols.punctuation.OpenParen, 
                Symbols.punctuation.CloseParen, 
                Symbols.punctuation.Comma, 
                () => this.parseExpression())
        };
    }
    private parseVarName() {
        const name = this.input.next();
        if (name.type === types.Variable) return name.value;
        this.input.fail("Expecting variable name, got " + JSON.stringify(name));
    }
    private parseIf() {
        this.skipKw(Symbols.keywords.If);
        const cond = this.parseExpression();
        if (!this.isPunc(Symbols.punctuation.OpenBlock)) {
            this.skipKw(Symbols.keywords.Then);
        }
        const then = this.parseExpression();
        const token: Token = {
            type: types.If,
            cond: cond,
            then: then
        };
        if (this.isKw(Symbols.keywords.Else)) {
            this.input.next();
            token.else = this.parseExpression();
        }
        return token;
    }
    private parseLambda(): Token {
        return {
            type: types.Lambda,
            vars: this.delimited(
                Symbols.punctuation.OpenParen, 
                Symbols.punctuation.CloseParen, 
                Symbols.punctuation.Comma, 
                () => this.parseVarName()),
            body: this.parseExpression()
        }
    }
    private parseBool(): Token {
        return {
            type: types.Boolean,
            value: this.input.next().value === Symbols.keywords.True
        };
    }

    private parseProg(): Token {
        const prog = this.delimited(
            Symbols.punctuation.OpenBlock,
            Symbols.punctuation.CloseBlock,
            Symbols.punctuation.EndExpression,
            () => this.parseExpression());

        return { type: types.Program, prog: prog };
    }

    private parseAtom() {
        return this.maybeCall(() => {
            if (this.isPunc(Symbols.punctuation.OpenParen)) {
                this.input.next();
                const expr = this.parseExpression();
                this.skipPunc(Symbols.punctuation.CloseParen);
                return expr;
            }
            
            if (this.isPunc(Symbols.punctuation.OpenBlock)) return this.parseProg();
            if (this.isKw(Symbols.keywords.If)) return this.parseIf();
            if (this.isKw(Symbols.keywords.True) || this.isKw(Symbols.keywords.False)) return this.parseBool();
            if (this.isKw(Symbols.keywords.Lambda)) {
                this.input.next();
                return this.parseLambda();
            }

            const tok = this.input.next();

            if (tok.type === Symbols.tokens.Variable || tok.type === Symbols.tokens.Number || tok.type === Symbols.tokens.String) {
                return tok;
            }

            this.unexpected(tok);
        });
    }
    private maybeCall(expr: () => Token) {
        const val = expr();
        return this.isPunc(Symbols.punctuation.OpenParen) ? this.parseCall(val): val;
    }
    private parseExpression(): Token {
        return this.maybeCall(() => this.maybeBinary(this.parseAtom(), 0));
    }
}