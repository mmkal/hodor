setTimeout(function () {
    var globalEnv = new Environment();
    // define the "print" primitive function
    globalEnv.def("print", function (txt) {
        console.log(txt);
    });
    function run(code) {
        const inputStream = new InputStream(code);
        const tokenStream = new TokenStream(inputStream);
        const parser = new Parser(tokenStream);
        const ast = parser.parse();
        const interpreter = new Interpreter(globalEnv);
        const foo = interpreter.evaluate(ast);
    }
    run("sum = lambda(x, y) x + y; print(sum(2, 3));");
}, 0);
class Environment {
    constructor(parent) {
        this.vars = Object.create(parent ? parent.vars : null);
        this.parent = parent;
    }
    extend() {
        return new Environment(this);
    }
    lookup(name) {
        let scope = this;
        while (scope) {
            if (Object.prototype.hasOwnProperty.call(scope.vars, name)) {
                return scope;
            }
            scope = scope.parent;
        }
        return scope;
    }
    get(name) {
        if (name in this.vars) {
            return this.vars[name];
        }
        throw new Error("Undefined variable " + name);
    }
    set(name, value) {
        const scope = this.lookup(name);
        if (!scope && this.parent) {
            throw new Error("Undefined variable " + name);
        }
        return (scope || this).vars[name] = value;
    }
    def(name, value) {
        return this.vars[name] = value;
    }
}
class InputStream {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.line = 1;
        this.column = 0;
    }
    next() {
        const char = this.peek();
        this.position++;
        if (char === "\n") {
            this.line++;
            this.column = 0;
        }
        else {
            this.column++;
        }
        return char;
    }
    peek() {
        return this.input[this.position];
    }
    eof() {
        return typeof (this.peek()) === "undefined";
    }
    fail(message) {
        throw new Error(`${message} (${this.line}:${this.column}). Character: "${this.input.split("\n")[this.line - 1][this.column]}". Line: "${this.input.split("\n")[this.line - 1]}"`);
    }
}
class Interpreter {
    constructor(env) {
        this.env = env;
    }
    evaluate(exp) {
        switch (exp.type) {
            case "num":
                return this.primitive(exp.value, "number");
            case "bool":
                return this.primitive(exp.value, "boolean");
            case "str":
                return exp.value;
            case "var":
                return this.env.get(exp.value);
            case "assign":
                if (exp.left.type !== "var") {
                    throw new Error("Canoot assign to " + JSON.stringify(exp.left));
                }
                return this.env.set(exp.left.value, this.evaluate(exp.right));
            case "binary":
                return this.applyOp(exp.operator, this.evaluate(exp.left), this.evaluate(exp.right));
            case "lambda":
                return this.makeLambda(exp);
            case "if":
                const cond = this.evaluate(exp.cond);
                if (cond !== false) {
                    return this.evaluate(exp.then);
                }
                return exp.else ? this.evaluate(exp.else) : false;
            case "prog":
                // TODO reduce
                let val = false;
                exp.prog.forEach(exp => val = this.evaluate(exp));
                return val;
            case "call":
                const func = this.evaluate(exp.func);
                return func.apply(null, exp.args.map(arg => this.evaluate(arg)));
            default:
                throw new Error("I don't know how to evaluate " + exp.type);
        }
    }
    primitive(value, type) {
        if (type !== "number" && type !== "boolean") {
            throw new Error(type + " is not a primitive type.");
        }
        let parsedValue;
        try {
            parsedValue = JSON.parse(value);
        }
        catch (jsonError) {
            throw new Error(`Expected a ${type} but got ${value}.`);
        }
        if (typeof parsedValue !== type) {
            throw new Error(`Expected a ${type} but got a ${typeof parsedValue}. Value: ${value}.`);
        }
        return parsedValue;
    }
    applyOp(op, a, b) {
        function num(x) {
            if (typeof x !== "number")
                throw new Error("Expected number but got " + x);
            return x;
        }
        function div(x) {
            if (num(x) === 0)
                throw new Error("Tried to divide by zero");
            return x;
        }
        switch (op) {
            case "+": return num(a) + num(b);
            case "-": return num(a) - num(b);
            case "*": return num(a) * num(b);
            case "/": return num(a) / div(b);
            case "%": return num(a) % div(b);
            case "&&": return a !== false && b;
            case "||": return a !== false ? a : b;
            case "<": return num(a) < num(b);
            case ">": return num(a) > num(b);
            case "<=": return num(a) <= num(b);
            case ">=": return num(a) >= num(b);
            case "==": return a === b;
            case "!=": return a !== b;
        }
        throw new Error("Can't apply operator " + op);
    }
    makeLambda(exp) {
        const _this = this;
        return function () {
            const names = exp.vars;
            const scope = new Interpreter(_this.env.extend());
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                const value = i < arguments.length ? arguments[i] : false;
                scope.env.def(name, value);
            }
            return scope.evaluate(exp.body);
        };
    }
}
class Parser {
    constructor(input) {
        this.input = input;
        this.FALSE = { type: Symbols.Tokens.Boolean, value: false };
        this.PRECEDENCE = {
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
    }
    parse() {
        return this.parseTopLevel();
    }
    isPunc(ch) {
        const tok = this.input.peek();
        return tok && tok.type == Symbols.Tokens.Punctuation && (!ch || tok.value == ch) && tok;
    }
    isKw(kw) {
        const tok = this.input.peek();
        return tok && tok.type == Symbols.Tokens.Keyword && (!kw || tok.value == kw) && tok;
    }
    isOp(op) {
        const tok = this.input.peek();
        return tok && tok.type == Symbols.Tokens.Operator && (!op || tok.value == op) && tok;
    }
    skipPunc(ch) {
        if (this.isPunc(ch))
            this.input.next();
        else
            this.input.fail("Expecting punctuation: \"" + ch + "\"");
    }
    skipKw(kw) {
        if (this.isKw(kw))
            this.input.next();
        else
            this.input.fail("Expecting keyword: \"" + kw + "\"");
    }
    skipOp(op) {
        if (this.isOp(op))
            this.input.next();
        else
            this.input.fail("Expecting operator: \"" + op + "\"");
    }
    unexpected(tok) {
        this.input.fail("Unexpected token: " + JSON.stringify(tok || this.input.peek()));
    }
    maybeBinary(left, precedence) {
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
    delimited(start, stop, separator, parser) {
        const a = [];
        let first = true;
        this.skipPunc(start);
        while (!this.input.eof()) {
            if (this.isPunc(stop))
                break;
            if (first) {
                first = false;
            }
            else {
                this.skipPunc(separator);
            }
            if (this.isPunc(stop))
                break;
            a.push(parser());
        }
        this.skipPunc(stop);
        return a;
    }
    parseCall(func) {
        return {
            type: Symbols.Tokens.Call,
            func: func,
            args: this.delimited(Symbols.Punctuation.OpenParen, Symbols.Punctuation.CloseParen, Symbols.Punctuation.Comma, () => this.parseExpression())
        };
    }
    parseVarName() {
        const name = this.input.next();
        if (name.type !== Symbols.Tokens.Variable)
            this.input.fail("Expecting variable name, got " + JSON.stringify(name));
        return name.value;
    }
    parseIf() {
        this.skipKw(Symbols.Keywords.If);
        const cond = this.parseExpression();
        if (!this.isPunc(Symbols.Punctuation.OpenBlock)) {
            this.skipKw(Symbols.Keywords.Then);
        }
        const then = this.parseExpression();
        const token = {
            type: Symbols.Keywords.If,
            cond: cond,
            then: then
        };
        if (this.isKw(Symbols.Keywords.Else)) {
            this.input.next();
            token.else = this.parseExpression();
        }
        return token;
    }
    parseLambda() {
        return {
            type: Symbols.Tokens.Lambda,
            vars: this.delimited(Symbols.Punctuation.OpenParen, Symbols.Punctuation.CloseParen, Symbols.Punctuation.Comma, () => this.parseVarName()),
            body: this.parseExpression()
        };
    }
    parseBool() {
        return {
            type: Symbols.Tokens.Boolean,
            value: this.input.next().value === Symbols.Keywords.True
        };
    }
    parseTopLevel() {
        const prog = new Array();
        while (!this.input.eof()) {
            prog.push(this.parseExpression());
            if (!this.input.eof()) {
                this.skipPunc(Symbols.Punctuation.EndExpression);
            }
        }
        return { type: Symbols.Tokens.Program, prog: prog };
    }
    parseProg() {
        const prog = this.delimited(Symbols.Punctuation.OpenBlock, Symbols.Punctuation.CloseBlock, Symbols.Punctuation.EndExpression, () => this.parseExpression());
        if (prog.length === 0)
            return this.FALSE;
        if (prog.length === 1)
            return prog[0];
        return { type: Symbols.Tokens.Program, prog: prog };
    }
    parseAtom() {
        return this.maybeCall(() => {
            if (this.isPunc(Symbols.Punctuation.OpenParen)) {
                this.input.next();
                const expr = this.parseExpression();
                this.skipPunc(Symbols.Punctuation.CloseParen);
                return expr;
            }
            if (this.isPunc(Symbols.Punctuation.OpenBlock))
                return this.parseProg();
            if (this.isKw(Symbols.Keywords.If))
                return this.parseIf();
            if (this.isKw(Symbols.Keywords.True) || this.isKw(Symbols.Keywords.False))
                return this.parseBool();
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
    maybeCall(expr) {
        const val = expr();
        return this.isPunc(Symbols.Punctuation.OpenParen) ? this.parseCall(val) : val;
    }
    parseExpression() {
        return this.maybeCall(() => this.maybeBinary(this.parseAtom(), 0));
    }
}
var Symbols;
(function (Symbols) {
    function values(symbolClass) {
        return new Set(Object.keys(symbolClass).map(k => symbolClass[k]));
    }
    Symbols.Operators = {
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
        values: new Set(),
        characters: new Set()
    };
    Symbols.Punctuation = {
        OpenBlock: "{",
        CloseBlock: "}",
        OpenBrace: "[",
        CloseBrace: "]",
        OpenParen: "(",
        CloseParen: ")",
        Comma: ",",
        EndExpression: ";",
        values: new Set()
    };
    Symbols.Keywords = {
        If: "if",
        Then: "then",
        Else: "else",
        Lambda: "lambda",
        True: "true",
        False: "false",
        values: new Set()
    };
    Symbols.Delimiters = {
        Escape: "\\",
        Quote: "\"",
        Dot: ".",
        values: new Set()
    };
    Symbols.Tokens = {
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
        values: new Set()
    };
    const symbolClasses = [Symbols.Operators, Symbols.Punctuation, Symbols.Keywords, Symbols.Delimiters, Symbols.Tokens];
    symbolClasses.forEach((symbolClass) => {
        const values = Object
            .keys(symbolClass)
            .map(k => symbolClass[k])
            .filter(v => typeof v === "string");
        symbolClass.values = new Set(values);
        symbolClass.characters = new Set(values.map(v => v.charAt(0)));
    });
})(Symbols || (Symbols = {}));
class TokenStream {
    constructor(input) {
        this.input = input;
        this.current = null;
    }
    isKeyword(word) {
        return Symbols.Keywords.values.has(word);
    }
    isDigit(ch) {
        return /[0-9]/i.test(ch);
    }
    isIdStart(ch) {
        return /[a-z_]/i.test(ch);
    }
    isId(ch) {
        return this.isIdStart(ch) || "?!-<>=0123456789".indexOf(ch) >= 0;
    }
    isOpChar(ch) {
        return Symbols.Operators.characters.has(ch);
    }
    isPunc(ch) {
        return Symbols.Punctuation.values.has(ch);
    }
    isWhitespace(ch) {
        return " \t\n".indexOf(ch) >= 0;
    }
    readWhile(predicate) {
        const chars = [];
        while (!this.input.eof() && predicate(this.input.peek())) {
            chars.push(this.input.next());
        }
        return chars.join("");
    }
    readNumber() {
        let hasDot = false;
        const number = this.readWhile(ch => {
            if (ch === Symbols.Delimiters.Dot) {
                if (hasDot)
                    return false;
                hasDot = true;
                return true;
            }
            return this.isDigit(ch);
        });
        return { type: Symbols.Tokens.Number, value: parseFloat(number).toString() };
    }
    readIdent() {
        const id = this.readWhile(ch => this.isId(ch));
        return {
            type: this.isKeyword(id) ? Symbols.Tokens.Keyword : Symbols.Tokens.Variable,
            value: id
        };
    }
    readEscaped(end) {
        let escaped = false;
        let chars = [];
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
    readString() {
        return {
            type: Symbols.Tokens.String,
            value: this.readEscaped(Symbols.Delimiters.Quote)
        };
    }
    skipComment() {
        this.readWhile(ch => ch !== "\n");
        this.input.next();
    }
    readNext() {
        this.readWhile(ch => this.isWhitespace(ch));
        if (this.input.eof())
            return null;
        let ch = this.input.peek();
        if (ch === "#") {
            this.skipComment();
            return this.readNext();
        }
        if (ch === Symbols.Delimiters.Quote)
            return this.readString();
        if (this.isDigit(ch))
            return this.readNumber();
        if (this.isIdStart(ch))
            return this.readIdent();
        if (this.isPunc(ch))
            return { type: Symbols.Tokens.Punctuation, value: this.input.next() };
        if (this.isOpChar(ch))
            return { type: Symbols.Tokens.Operator, value: this.readWhile(ch => this.isOpChar(ch)) };
        this.input.fail("Unexpected character: " + ch);
    }
    peek() {
        return this.current || (this.current = this.readNext());
    }
    next() {
        const token = this.current;
        this.current = null;
        return token || this.readNext();
    }
    eof() {
        return this.peek() === null;
    }
    fail(message) {
        this.input.fail(message);
    }
}
//# sourceMappingURL=foo.js.map