// tslint:disable:no-var-requires

import IS_NODE from "./utils/is-node";

if (!IS_NODE) {
    throw new Error(`The CLI must be executed under Node.js`);
}

const Oviz = require("./index").default;

const path = require("path");
const fs = require("fs");

function resolve(p: string) {
    return path.join(process.cwd(), p);
}

const argv = process.argv[0].endsWith("/node") ? process.argv.slice(2) : process.argv.slice(1);

let outFile: string | undefined;
let currOpt: string | null = null;
const opts: [string, string][] = [];

for (const arg of argv) {
    if (currOpt) {
        opts.push([currOpt!, arg]);
        currOpt = null;
    } else if (arg.startsWith("-")) {
        currOpt = arg;
    } else {
        outFile = resolve(arg);
    }
}

let templatePath: string | undefined;
let dataPath: string | undefined;

console.log(outFile);
console.log(opts);
for (const [name, value] of opts) {
    switch (name) {
        case "--template":
        case "-t":
            templatePath = resolve(value);
            break;
        case "--data":
        case "-d":
            dataPath = resolve(value);
            break;
    }
}

if (!outFile) {
    console.error(`Output filename is not specified`);
    process.exit(1);
}

if (!templatePath) {
    console.error(`Template is not specfied.`);
    process.exit(1);
}
const template = fs.readFileSync(templatePath).toString();

let data: any = {};
if (dataPath) {
    data = JSON.parse(fs.readFileSync(dataPath).toString());
}

const { visualizer } = Oviz.visualize({
    renderer: "svg-offline",
    template,
    data,
});

const svg = visualizer.rendererCtx.svgText;
fs.writeFileSync(outFile, svg);
