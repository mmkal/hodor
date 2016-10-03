"use strict";

// ava library checks for process.send being a function to determine if we're running from cli or in node, so do the same here.
const isDebugging = typeof process.send !== "function";

let initialProcessArgs: string[];
let cwd: string;

// If we're debugging, do some shimming so ava doesn't complain about bad setup.
if (isDebugging) {
    // Save initial process args, ava messes around with some stuff.
    initialProcessArgs = [...process.argv];
    cwd = process.cwd();

    // tests aren't run in processes anymore
    process.send = function() { };

    // ava will parse process.argv[2], and happens to need valid values for .file and .precompiled.
    // We're overwriting process.send and test(...) so it doesn't need to be meaningful, it just needs
    // to work. It'll use string indexing on opts.precompiled (hence empty object) and will use 
    // require(opts.file), hence "path" (a pretty safe bet for a valid require).
    const avaOptions = { file: "path", precompiled: {}, resolveTestsFrom: cwd };
    process.argv[2] = JSON.stringify(avaOptions);
}

import ava = require("ava");

if (isDebugging) {
    process.chdir(__dirname);

    const Test = require("ava/lib/test");
    const AvaFiles = require("ava-files");
    const beautifyStack = require("ava/lib/beautify-stack");

    const _runningTests = new Array<Promise<any>>();
    let failedTests = 0;

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
        process.stdout.write(`Running test ${test.title}... `);
        const result = await test.run();
        if (test.assertError) {
            console.error("Failed.");

            // Prettify stack, but make sure cwd stays in there so that you can click the console error messages.
            const nixCwd = cwd.replace("\\", "/");
            let prettyStack: string = beautifyStack(test.assertError.stack);
            prettyStack = prettyStack.replace(/\((.*:\d+:\d+)\)/g, (match, group1) => "(" + nixCwd + "/" + group1 + ")");
            test.assertError.stack = prettyStack;
            console.error(test.assertError);

            failedTests++;
        }
        else {
            console.log("Passed.");
        }

        const index = _runningTests.indexOf(testFinished);
        if (index > -1) {
            _runningTests.splice(index, 1);
        }
        finished(result);
        if (_runningTests.length === 0) {
            process.exit(failedTests === 0 ? 0 : 1);
        }
    }

    const oldTest: any = ava.test;
    const newTest: any = runTest;

    Object.defineProperty(ava, "test", {
        get() {
            return newTest;
        }
    });

    Object.keys(oldTest).forEach(k => newTest[k] = oldTest[k]);

    (async function() {
        const avaFiles = new AvaFiles({ files: initialProcessArgs.slice(2), cwd: cwd });
        const testFiles: string[] = await avaFiles.findTestFiles();
        testFiles.forEach(require);
    })();
}

// Re-export ava.test so users can require this module the same way as ava.
export default ava.test;

export const test = ava.test;

const options: { resolveTestsFrom: string } = JSON.parse(process.argv[2]);
export const packageDir = options.resolveTestsFrom;