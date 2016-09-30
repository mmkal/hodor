import tape = require("tape");

// let prettify = require("tap-spec");
//tape.createStream().pipe(prettify()).pipe(process.stdout);

interface PromiseCase {
	(t: tape.Test): void | Promise<{}>;
}

/**
 * Create a new test with an optional name string and optional opts object.
 * cb(t) fires with the new test object t once all preceeding tests have finished.
 * If you make cb(t) return a promise, it will be awaited before ending the test.
 * Tests execute serially.
 */
function greatApe(cb: PromiseCase): void;
function greatApe(name: string, cb: PromiseCase): void;
function greatApe(name: string, opts: tape.TestOptions, cb: PromiseCase): void; 
function greatApe() {
	let name: string, opts: tape.TestOptions, cb: PromiseCase;
	if (arguments.length === 1) {
		cb = arguments[0];
	}
	else if (arguments.length === 2) {
		if (typeof arguments[0] === "string") {
			name = arguments[0];
		}
		else {
			opts = arguments[0];
		}
		cb = arguments[1];
	}
	else {
		name = arguments[0];
		opts = arguments[1];
		cb = arguments[2];
	}
	if (typeof cb !== "function") {
		throw new TypeError(`Test callback should be a function, instead it's ${typeof cb}`);
	}
	if (name && typeof name !== "string") {
		throw new TypeError(`Test name should be a string, instead it's ${typeof name}`);
	}
	tape(name, opts, async (t: tape.Test) => {
		try {
			await cb(t);
		}
		catch (e) {
			t.fail(e && e.toString());
		}
		t.end();
	});
}

export default greatApe;