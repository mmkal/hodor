process.send = function() {
    console.log("process.send called. Arguments:");
    console.dir(arguments);
}
process.argv[2] = JSON.stringify({ file: "..", precompiled: {} });

import ava = require("ava");
const Test = require("ava/lib/test");

async function runTest() {
    const args = [...arguments]
    args.unshift(null);
    const test = new (Function.prototype.bind.apply(Test, args));
    console.log(`Running test ${test.title}`);
    const result = await test.run();
    test.assertError && console.error(test.assertError);
}

console.log(ava.test.name);

Object.defineProperty(ava, "test", {
    get() {
        return runTest;
    }
});

const avaTest = ava.test;
console.log(avaTest);

ava.test("foo1", async (t: any) => {
    await new Promise(r => setTimeout(r, 1000));
    t.is("hi", "bye");
});

ava.test("foo2", async (t: any) => {
    await new Promise(r => setTimeout(r, 1000));
    t.is("hi", "bye");
});

ava.test("foo3", async (t: any) => {
    await new Promise(r => setTimeout(r, 1000));
    t.is("hi", "bye");
});

ava.test("foo4", async (t: any) => {
    await new Promise(r => setTimeout(r, 1000));
    t.is("hi", "bye");
});