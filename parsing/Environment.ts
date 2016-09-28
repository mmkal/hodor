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
}