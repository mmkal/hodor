const watch = require("glob-watcher");
const tsc = require("node-typescript-compiler");

console.log("watcher starting.");
watch(["**/*.ts"], async (done: () => void) => {
    console.log("detected change, compiling typescript.");
    await tsc.compile({ project: "." });
    console.log("finished compiling typescript.");
});