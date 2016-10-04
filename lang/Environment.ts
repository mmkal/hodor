import Interpreter from "./Interpreter";
import Hodor from "./Hodor";

export default class Environment {
    public vars: { [key: string]: boolean };
    public parent: Environment;

    constructor(parent?: Environment) {
        this.vars = Object.create(parent ? parent.vars : null);
        this.parent = parent;
    }
    
    extend() {
        return new Environment(this);
    }
    lookup (name: string) {
        let scope: Environment = this;
        while (scope) {
            if (Object.prototype.hasOwnProperty.call(scope.vars, name)) {
                return scope;
            }
            scope = scope.parent;
        }
        return scope;
    }
    get (name: string) {
        if (name in this.vars) {
            return this.vars[name];
        }
        throw new Error("Undefined variable " + name);
    }
    set (name: string, value: any) {
        const scope = this.lookup(name);
        if (!scope && this.parent) {
            throw new Error("Undefined variable " + name);
        }
        return (scope || this).vars[name] = value;
    }

    def (name: string, value: any) {
        return this.vars[name] = value;
    }

    withConsoleLogger() {
        this.def("print", (txt: any) => console.log(txt));
        return this;
    }

    withHodor() {
        this.def("hodor", (wylis: string) => Hodor.Hodor(wylis));
        this.def("wylis", (hodor: string) => Hodor.Wylis(hodor));
        return this;
    }

    withAccessors() {
        this.def("prop", (obj: any, prop: string, value?: any) => {
            if (arguments.length < 3) {
                return obj[prop];
            }
            else {
                return obj[prop] = value;
            }
        });
        this.def("call", (obj: any, method: string, ...args: any[]) => {
            return obj[method].apply(obj, [...arguments].slice(2));
        });
        return this;
    }

    withConstructors() {
        this.def("construct", (type: any, ...args: any[]) => {
            return new (Function.prototype.bind.apply(type, args));
        });
        return this;
    }

    withPrimitives() {
        return this.withKVs({String, Number, Boolean});
    }

    withEval() {
        this.def("eval", (code: string) => this.createInterpreter().execute(code));
        return this;
    }

    withKVs(obj: any) {
        Object.keys(obj).forEach(k => this.def(k, obj[k]));
        return this;
    }

    static createStandard(): Environment {
        return new Environment()
            .withEval()
            .withConsoleLogger()
            .withPrimitives()
            .withHodor()
            .withAccessors()
            .withConstructors()
            .withKVs({require, process, __dirname, __filename})
            ;
    }

    createInterpreter() {
        return new Interpreter(this);
    }
}