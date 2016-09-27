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
        const interpreter = new Interpreter();
        const foo = interpreter.evaluate(ast, globalEnv);
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
    evaluate(exp, env) {
        switch (exp.type) {
            case "num":
                return this.primitive(exp.value, "number");
            case "bool":
                return this.primitive(exp.value, "boolean");
            case "str":
                return exp.value;
            case "var":
                return env.get(exp.value);
            case "assign":
                if (exp.left.type !== "var") {
                    throw new Error("Canoot assign to " + JSON.stringify(exp.left));
                }
                return env.set(exp.left.value, this.evaluate(exp.right, env));
            case "binary":
                return this.applyOp(exp.operator, this.evaluate(exp.left, env), this.evaluate(exp.right, env));
            case "lambda":
                return this.makeLambda(env, exp);
            case "if":
                const cond = this.evaluate(exp.cond, env);
                if (cond !== false) {
                    return this.evaluate(exp.then, env);
                }
                return exp.else ? this.evaluate(exp.else, env) : false;
            case "prog":
                // TODO reduce
                let val = false;
                exp.prog.forEach(exp => val = this.evaluate(exp, env));
                return val;
            case "call":
                const func = this.evaluate(exp.func, env);
                return func.apply(null, exp.args.map(arg => this.evaluate(arg, env)));
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
    makeLambda(env, exp) {
        var lambda = function () {
            var names = exp.vars;
            var scope = env.extend();
            for (var i = 0; i < names.length; ++i)
                scope.def(names[i], i < arguments.length ? arguments[i] : false);
            return this.evaluate(exp.body, scope);
        }.bind(this);
        return lambda;
    }
}
class Parser {
    constructor(input) {
        this.input = input;
        this.FALSE = { type: "bool", value: false };
        this.PRECEDENCE = {
            "=": 1,
            "||": 2,
            "&&": 3,
            "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7,
            "+": 10, "-": 10,
            "*": 20, "/": 20, "%": 20,
        };
    }
    parse() {
        return this.parseTopLevel();
    }
    isPunc(ch) {
        const tok = this.input.peek();
        return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
    }
    isKw(kw) {
        const tok = this.input.peek();
        return tok && tok.type == "kw" && (!kw || tok.value == kw) && tok;
    }
    isOp(op) {
        const tok = this.input.peek();
        return tok && tok.type == "op" && (!op || tok.value == op) && tok;
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
                    type: tok.value === "=" ? "assign" : "binary",
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
            type: "call",
            func: func,
            args: this.delimited("(", ")", ",", () => this.parseExpression())
        };
    }
    parseVarName() {
        const name = this.input.next();
        if (name.type !== "var")
            this.input.fail("Expecting variable name, got " + JSON.stringify(name));
        return name.value;
    }
    parseIf() {
        this.skipKw("if");
        const cond = this.parseExpression();
        if (!this.isPunc("{")) {
            this.skipKw("then");
        }
        const then = this.parseExpression();
        const token = {
            type: "if",
            cond: cond,
            then: then
        };
        if (this.isKw("else")) {
            this.input.next();
            token.else = this.parseExpression();
        }
        return token;
    }
    parseLambda() {
        return {
            type: "lambda",
            vars: this.delimited("(", ")", ",", () => this.parseVarName()),
            body: this.parseExpression()
        };
    }
    parseBool() {
        return {
            type: "bool",
            value: this.input.next().value === "true"
        };
    }
    parseTopLevel() {
        const prog = new Array();
        while (!this.input.eof()) {
            prog.push(this.parseExpression());
            if (!this.input.eof()) {
                this.skipPunc(";");
            }
        }
        return { type: "prog", prog: prog };
    }
    parseProg() {
        const prog = this.delimited("{", "}", ";", () => this.parseExpression());
        if (prog.length === 0)
            return this.FALSE;
        if (prog.length === 1)
            return prog[0];
        return { type: "prog", prog: prog };
    }
    parseAtom() {
        return this.maybeCall(() => {
            if (this.isPunc("(")) {
                this.input.next();
                const expr = this.parseExpression();
                this.skipPunc(")");
                return expr;
            }
            if (this.isPunc("{"))
                return this.parseProg();
            if (this.isKw("if"))
                return this.parseIf();
            if (this.isKw("true") || this.isKw("false"))
                return this.parseBool();
            if (this.isKw("lambda")) {
                this.input.next();
                return this.parseLambda();
            }
            const tok = this.input.next();
            if (tok.type === "var" || tok.type === "num" || tok.type === "str") {
                return tok;
            }
            this.unexpected(tok);
        });
    }
    maybeCall(expr) {
        const val = expr();
        return this.isPunc("(") ? this.parseCall(val) : val;
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
    const symbolClasses = [Symbols.Operators, Symbols.Punctuation, Symbols.Keywords];
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
        this.keywords = new Set("if then else lambda λ true false".split(" "));
        this.escapeChar = "\\";
        this.quoteMark = "\"";
        this.dot = ".";
    }
    isKeyword(word) {
        return this.keywords.has(word);
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
        //      TODO remove  return "+-*/%=&|<>!".indexOf(ch) >= 0;
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
            if (ch === this.dot) {
                if (hasDot)
                    return false;
                hasDot = true;
                return true;
            }
            return this.isDigit(ch);
        });
        return { type: "num", value: parseFloat(number).toString() };
    }
    readIdent() {
        const id = this.readWhile(ch => this.isId(ch));
        return {
            type: this.isKeyword(id) ? "kw" : "var",
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
    readString() {
        return {
            type: "str",
            value: this.readEscaped(this.quoteMark)
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
        if (ch === this.quoteMark)
            return this.readString();
        if (this.isDigit(ch))
            return this.readNumber();
        if (this.isIdStart(ch))
            return this.readIdent();
        if (this.isPunc(ch))
            return { type: "punc", value: this.input.next() };
        if (this.isOpChar(ch))
            return { type: "op", value: this.readWhile(ch => this.isOpChar(ch)) };
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