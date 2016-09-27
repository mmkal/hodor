class Interpreter {
    evaluate(exp: Token, env: Environment): any {
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

    primitive(value: any, type: string) {
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

    makeLambda(env: Environment, exp: any) { // TODO exp should be Token
        var lambda = function() { // TODO why declare and then return function?
            var names = exp.vars;
            var scope = env.extend();
            for (var i = 0; i < names.length; ++i)
                scope.def(names[i], i < arguments.length ? arguments[i] : false);
            return this.evaluate(exp.body, scope);
        }.bind(this);
        return lambda;   
    }
}