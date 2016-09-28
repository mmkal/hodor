import tape = require("tape");

interface PromiseCase {
	(t: tape.Test): void | Promise<{}>;
}

/**
 * Create a new test with an optional name string and optional opts object.
 * cb(t) fires with the new test object t once all preceeding tests have finished.
 * Tests execute serially.
 */
function greatApe(cb: PromiseCase): void;
function greatApe(name: string, cb: PromiseCase): void;
function greatApe(name: string, opts: tape.TestOptions, cb: PromiseCase): void; 
function greatApe() {
	let name: any, opts: any, cb: any;
	if (arguments.length === 1) {
		cb = arguments[0];
	}
	else if (arguments.length === 2) {
		cb = arguments[1];
		if (typeof arguments[0] === "string") {
			name = arguments[0];
		}
		else {
			opts = arguments[0];
		}
	}
	tape(name, opts, createTapeCallback(cb));
}

function createTapeCallback(cb: PromiseCase) {
	return async (t: tape.Test) => {
        try {
            await cb(t);
            t.pass();
        } catch (e) {
            t.fail(e && e.toString());
        }
        t.end();
    }
}

export default greatApe;