import Symbols from "./Symbols"
import Environment from "./Environment"
import Parser from "./Parser"
import TokenStream from "./TokenStream"
import InputStream from "./InputStream"
import { Transpiler } from "./Transpiler";

export default class Interpreter {
    constructor(public env: Environment) {
        this.env.def("eval", (code: string) => this.execute(code));
    }

    execute(code: string): any {
        return this.evaluate(new Parser(new TokenStream(new InputStream(code))).parse());
    }

    evaluate(exp: Token): any {
        switch (exp.type) {
            case Symbols.Tokens.Number:
                return this.primitive(exp.value, "number");
            case Symbols.Tokens.Boolean:
                return this.primitive(exp.value, "boolean");
            case Symbols.Tokens.String:
                return Transpiler.Wylis(exp.value);

            case Symbols.Tokens.Variable:
                return this.env.get(exp.value);

            case Symbols.Tokens.Assign:
                if (exp.left.type !== Symbols.Tokens.Variable) {
                    throw new Error("Cannot assign to " + JSON.stringify(exp.left));
                }
                return this.env.set(exp.left.value, this.evaluate(exp.right));

            case Symbols.Tokens.Binary:
                return this.applyOp(exp.operator, this.evaluate(exp.left), this.evaluate(exp.right));

            case Symbols.Tokens.Lambda:
                return this.makeLambda(exp);

            case Symbols.Tokens.If:
                const cond = this.evaluate(exp.cond);
                if (cond !== false) {
                    return this.evaluate(exp.then);
                }
                return exp.else ? this.evaluate(exp.else) : false;

            case Symbols.Tokens.Program:
                return exp.prog.reduce((prev, currentToken) => this.evaluate(currentToken), false);

            case Symbols.Tokens.Call:
                const func = this.evaluate(exp.func);
                return func.apply(null, exp.args.map(arg => this.evaluate(arg)));

            default:
                throw new Error("Invalid token type: " + exp.type);
        }
    }

    private primitive(value: any, type: string) {
        if (typeof value === type) {
            return value;
        }
        if (type !== "number" && type !== "boolean") {
            throw new Error(type + " is not a primitive type.");
        }
        let parsedValue: any;
        try {
            parsedValue = JSON.parse(value);
        } catch (jsonError) {
            throw new Error(`Expected a ${type} but got ${value}.`);
        }
        if (typeof parsedValue !== type) {
            throw new Error(`Expected a ${type} but got a ${typeof parsedValue}. Value: ${value}.`);
        }
        return parsedValue;
    }

    applyOp(op: string, a: any, b: any) {
        function num(x: number) {
            if (typeof x !== "number") throw new Error("Expected number but got " + x);
            return x;
        }
        function div(x: number) {
            if (num(x) === 0) throw new Error("Tried to divide by zero");
            return x;
        }
        switch (op) {
            case Symbols.Operators.Plus: return a + b;
            case Symbols.Operators.Minus: return num(a) - num(b);
            case Symbols.Operators.Multiply: return num(a) * num(b);
            case Symbols.Operators.Divide: return num(a) / div(b);
            case Symbols.Operators.Modulo: return num(a) % div(b);
            case Symbols.Operators.And: return a !== false && b;
            case Symbols.Operators.Or: return a !== false ? a : b;
            case Symbols.Operators.LessThan: return num(a) < num(b);
            case Symbols.Operators.GreaterThan: return num(a) > num(b);
            case Symbols.Operators.Leq: return num(a) <= num(b);
            case Symbols.Operators.Geq: return num(a) >= num(b);
            case Symbols.Operators.EqualTo: return a === b;
            case Symbols.Operators.NotEqualTo: return a !== b;
        }
        throw new Error("Can't apply operator " + op);
    }

    makeLambda(exp: any) {
        const _this = this;
        return function() {
            const names: any[] = exp.vars;
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