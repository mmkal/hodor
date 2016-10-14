"use strict";

// ava library checks for process.send being a function to determine if we're running from cli or in node, so do the same here.
const isDebugging = typeof process.send !== "function";

let initialProcessArgs: string[];
let cwd: string;

// If we're debugging, do some shimming so ava doesn't complain about bad setup.
/* istanbul ignore next */
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
    process.argv.splice(2, 0, JSON.stringify(avaOptions));
}

import ava = require("ava");
import minimist = require("minimist");
import path = require("path");
import fs = require("fs");

/* istanbul ignore next */
if (isDebugging) {
    const options = minimist(initialProcessArgs.slice(2));
    const sort: boolean = options["sort"];
    const sortResultFile = sort ? path.resolve(__filename + ".results.json") : null;

    // ava seems to change the working directory for some reason. Do the same so tests relying on that behave consistently.
    process.chdir(__dirname);

    const Test = require("ava/lib/test");
    const AvaFiles = require("ava-files");
    const beautifyStack = require("ava/lib/beautify-stack");

    interface ITest {
        title: string;
        run: () => Promise<any> | PromiseLike<any> | void;
        fn: Function;
        assertError: Error;
    }

    const tests = new Array<ITest>();

    function addTest() {
        const args = [...arguments];
        args.unshift(null);
        const test = new (Function.prototype.bind.apply(Test, args));

        tests.push(test);
    }

    async function runTest(test: ITest) {
        // If we've got an anonymous test, use function.toString() if it's short enough.
        if (!test.title || test.title === "[anonymous]") {
            const fn: string = test.fn.toString().replace(/\r?\n/g, " ");
            if (fn.length < 60) test.title = fn;
        }
        const result = await test.run();
        if (test.assertError) {
            console.error(test.title + " failed.");

            // Prettify stack, but make sure cwd stays in there so that you can click the console error messages.
            const nixCwd = cwd.replace("\\", "/");
            let prettyStack: string = beautifyStack(test.assertError.stack);
            prettyStack = prettyStack.replace(/(([^ \(]+):\d+:\d+)/g, (match, group1) => "(" + nixCwd + "/" + group1 + ")");
            test.assertError.stack = prettyStack;
            console.error(test.assertError);
        }
    }

    Object.defineProperty(ava, "test", {
        get() {
            return addTest;
        }
    });

    const oldTest: any = ava.test;
    const newTest: any = addTest;

    Object.keys(oldTest).forEach(k => newTest[k] = oldTest[k]);

    (async function() {
        // Find the test files.
        const avaFiles = new AvaFiles({ files: options._, cwd: cwd });
        const testFiles: string[] = await avaFiles.findTestFiles();

        // Require each of the filepaths directly. This will make their code run, and since we've now
        // replaced ava.test, whenever they call the test method, addTest() above will run.
        testFiles.forEach(require);

        // If a results file from the previous run exists, sort the tests to put failing ones first.
        let results: { [title: string]: boolean };
        if (sortResultFile && fs.existsSync(sortResultFile)) {
            results = JSON.parse(fs.readFileSync(sortResultFile, "utf8"));
            tests.sort((tLeft, tRight) => Number(results[tLeft.title]) - Number(results[tRight.title]));
        }

        for (const test of tests) {
            await runTest(test);
        }

        const passed = tests.filter(t => !t.assertError).length;
        const failed = tests.length - passed; 
        console.log(`${passed}/${tests.length} tests passed.`);
        failed && console.error(`${failed}/${tests.length} tests failed. See above for details.`);

        // Output test results info so they can be sorted next time, with failures going first.
        if (sortResultFile) {
            results = {};
            tests.forEach(t => results[t.title] = !t.assertError);
            fs.writeFileSync(sortResultFile, JSON.stringify(results), { encoding: "utf8" });
        }

        console.log("Exiting.");
        process.exit(failed === 0 ? 0 : 1);
    })();
}

// Re-export ava.test so users can require this module the same way as ava.
export default ava.test;

export const test = ava.test;

const avaOptions: { resolveTestsFrom: string } = JSON.parse(process.argv[2]);
export const packageDir = avaOptions.resolveTestsFrom;