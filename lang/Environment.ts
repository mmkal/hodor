import Interpreter from "./Interpreter";
import { Hodor } from "./Hodor";

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

    withFileIO(readFile: string = "readFile", writeFile: string = "writeFile") {
        const fs = require("fs");
        this.def(readFile, (path: string) => fs.readFileSync(path, "utf8"));
        this.def(writeFile, (path: string, text: string) => fs.writeFileSync(path, text, { encoding: "utf8" }));
        return this;
    }

    withHodor() {
        this.def("hodor", (wylis: string) => Hodor.Hodor(wylis));
        this.def("wylis", (hodor: string) => Hodor.Wylis(hodor));
        return this;
    }

    withStringFunctions() {
        this.def("fromCharCode", (code: number) => String.fromCharCode(code));
        return this;
    }

    static createStandard(): Environment {
        return new Environment().withConsoleLogger().withFileIO().withHodor().withStringFunctions();
    }

    createInterpreter() {
        return new Interpreter(this);
    }
}