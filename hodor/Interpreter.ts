import Symbols from "./Symbols"
import Environment from "./Environment"
import Parser from "./Parser"
import TokenStream from "./TokenStream"
import InputStream from "./InputStream"
import Hodor from "./Hodor";
import {Token, types} from "./Token";

export default class Interpreter {
    constructor(public env: Environment) {
    }

    execute(code: string): any {
        return this.evaluate(new Parser(new TokenStream(new InputStream(code))).parse());
    }

    evaluate(exp: Token): any {
        switch (exp.type) {
            case types.Number:
                return this.primitive(exp.value, "number");
            case types.Boolean:
                return this.primitive(exp.value, "boolean");
            case types.String:
                return Hodor.Wylis(exp.value);

            case types.Variable:
                return this.env.get(exp.value);

            case types.Assign:
                if (exp.left.type !== types.Variable) {
                    throw new Error("Cannot assign to " + JSON.stringify(exp.left));
                }
                return this.env.set(exp.left.value, this.evaluate(exp.right));

            case types.Binary:
                return this.applyOp(exp.operator, this.evaluate(exp.left), this.evaluate(exp.right));

            case types.Lambda:
                return this.makeLambda(exp);

            case types.If:
                const cond = this.evaluate(exp.cond);
                if (cond !== false) {
                    return this.evaluate(exp.then);
                }
                return exp.else ? this.evaluate(exp.else) : false;

            case types.Program:
                return exp.prog.reduce((prev, currentToken) => this.evaluate(currentToken), false);

            case types.Call:
                const func = this.evaluate(exp.func);
                return func.apply(null, exp.args.map(arg => this.evaluate(arg)));

            default:
                throw new Error("Invalid token type: " + exp.type);
        }
    }

    primitive(value: any, type: string) {
        if (typeof value === type) {
            return value;
        }
        if (type !== "number" && type !== "boolean") {
            throw new Error(type + " is not a primitive type.");
        }
        let parsedValue: any;
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
            case Symbols.operators.Plus: return a + b;
            case Symbols.operators.Minus: return num(a) - num(b);
            case Symbols.operators.Multiply: return num(a) * num(b);
            case Symbols.operators.Divide: return num(a) / div(b);
            case Symbols.operators.Modulo: return num(a) % div(b);
            case Symbols.operators.And: return a !== false && b;
            case Symbols.operators.Or: return a !== false ? a : b;
            case Symbols.operators.LessThan: return num(a) < num(b);
            case Symbols.operators.GreaterThan: return num(a) > num(b);
            case Symbols.operators.Leq: return num(a) <= num(b);
            case Symbols.operators.Geq: return num(a) >= num(b);
            case Symbols.operators.EqualTo: return a === b;
            case Symbols.operators.NotEqualTo: return a !== b;
        }
        throw new Error("Can't apply operator " + op);
    }

    makeLambda(exp: any) {
        const _this = this;
        return function() {
            const names = exp.vars.map((t: any) => t.value);
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