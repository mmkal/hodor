import fs = require("fs");
import path = require("path");
import Samples from "../hodor/Samples"

const tsconfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));

const outDir: string = tsconfig.compilerOptions.outDir;

const appOutDir = path.join(outDir, __dirname);

console.log(appOutDir);

const serverFile = "app/app.hodor";

const wylisCode = fs.readFileSync("app/app.hodor.wylis", "utf8");

const hodorCode = Samples.fromPseudoHodor(wylisCode);

fs.writeFileSync(serverFile, hodorCode, "utf8");