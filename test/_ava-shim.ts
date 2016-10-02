process.send = function() {
    console.log("process.send called. Arguments:");
    console.dir(arguments);
}
process.argv[2] = JSON.stringify({ file: "..", precompiled: {} });

import ava = require("ava");
const Test = require("ava/lib/test");

const _runningTests = new Array<Promise<any>>();

async function runTest() {
    const args = [...arguments]
    args.unshift(null);
    const test = new (Function.prototype.bind.apply(Test, args));

    let finished: (value?: any | PromiseLike<any>) => void;
    const testFinished = new Promise(resolve => {
        finished = resolve;
    });
    const currentTests = [..._runningTests];
    _runningTests.push(testFinished);
    if (currentTests.length > 0) {
        await Promise.all(currentTests);
    }
    console.log(`Running test ${test.title}`);
    const result = await test.run();
    test.assertError && console.error(test.assertError);

    const index = _runningTests.indexOf(testFinished);
    if (index > -1) {
        _runningTests.splice(index, 1);
    }
    finished(result);
}

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