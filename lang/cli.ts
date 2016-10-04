#! /usr/bin/env node
import fs = require("fs");
import Environment from "./Environment";
import repl = require("repl");
import Hodor from "./Hodor";
import chalk = require("chalk");

const hodorArgv = process.argv.slice(2);
const __hodorfile = hodorArgv[0];

if (__hodorfile) {
    const code = fs.readFileSync(__hodorfile, "utf8");
    const interpreter = Environment.createStandard().withKVs({__hodorfile}).createInterpreter();
    interpreter.execute(code);
}
else {
    const interpreter = Environment.createStandard().createInterpreter();
    const hodorRepl = repl.start({
        prompt: chalk.green("Hodor? "),
        eval: (cmd: string, context: any, filename: string, callback: Function) => {
            const input = cmd.trim();
            try {
                console.log(JSON.stringify(interpreter.execute(input)));
            }
            catch (evalError) {
                try {
                    console.log(chalk.blue("Hodor! ") + Hodor.Wylis(input));
                }
                catch(wylisError) {
                    console.log(chalk.red("Hodor! ") + Hodor.Hodor(input));
                }
            }
            callback();
        }
    });
}
    