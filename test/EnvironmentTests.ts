import Environment from "../hodor/Environment";

const env = new Environment();

test("Undefined variable get", () => {
    expect(() => env.get("invalidvariable")).toThrow();
});
