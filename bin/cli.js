#! /usr/bin/env node
const fs = require("fs");
const repl = require("repl");
const Hodor = require("../output/hodor");
const chalk = require('./colors')

const hodorArgv = process.argv.slice(2);
const __hodorfile = hodorArgv[0];

const createNodeEnvironment = () => Hodor.Environment
  .createBasic()
  .withKVs({global, require: eval('require'), process, __dirname, __filename})

if (__hodorfile) {
  const code = fs.readFileSync(__hodorfile, "utf8");
  const interpreter = createNodeEnvironment()
    .withKVs({ __hodorfile })
    .createInterpreter();
  interpreter.execute(code);
} else {
  const interpreter = createNodeEnvironment().createInterpreter();
  repl.start({
    prompt: chalk.green("Hodor? "),
    eval: (
      cmd,
      _context,
      _filename,
      callback
    ) => {
      const input = cmd.trim();
      try {
        const value = interpreter.execute(input);
        const toPrint = value ? JSON.stringify(value) : value;
        typeof toPrint !== "undefined" &&
          console.log(chalk.yellow("Hodor! ") + chalk.grey(toPrint));
      } catch (evalError) {
        try {
          console.log(chalk.blue("Hodor! ") + Hodor.Wylis(input));
        } catch (wylisError) {
          console.log(chalk.red("Hodor! ") + Hodor.Hodor(input));
        }
      }
      callback();
    },
  });
}
