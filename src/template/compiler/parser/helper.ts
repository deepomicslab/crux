import { Anchor } from "../../../defs/geometry";
import { toDeg } from "../../../utils/math";
import { HELPER } from "../tokens";

const ANCHOR_LIST = {
    top: Anchor.Top,
    middle: Anchor.Middle,
    bottom: Anchor.Bottom,
    left: Anchor.Left,
    center: Anchor.Center,
    right: Anchor.Right,
};

const exprHelpers: Record<string, (args: string[]) => [string, boolean]> = {
    "scale-linear": (args) => {
        const domain = args.length === 2 ? `[${args[0]}, ${args[1]}]` : "null";
        const range = args.length === 4 ? `[${args[2]}, ${args[3]}]` : "null";
        return [
            `{ __scale__: true, type: "linear", domain: ${domain}, range: ${range} }`,
            false,
        ];
    },
    "scaled": (args) => {
        const horizontal = args.length > 1 ? args[1] : true;
        return [`this._scale(${args[0]}, ${horizontal})`, true];
    },
    "scaled-x": (args) => {
        return [`this._scale(${args[0]}, true)`, true];
    },
    "scaled-y": (args) => {
        return [`this._scale(${args[0]}, false)`, true];
    },
    "clip": (args) => {
        if (args[0] !== "bound") {
            throw new Error(`Unknown clip path type "${args[0]}`);
        }
        return [
            `{ type: "${args[0]}", inset: 0, rx: ${args[1] || 0}, ry: ${args[2] || 0} }`,
            false,
        ];
    },
    "rotate": (args) => {
        const angle = parseInt(args[0].slice(0, -3));
        const unit = args[0].slice(-3);
        const value = unit === "rad" ? toDeg(angle) : angle;
        return [`this._rotate(${value})`, true];
    },
    "anchor": (args) => {
        const [a1, a2] = args.map(x => ANCHOR_LIST[x]);
        if (!a1 || ! a2)
            throw Error(`Wrong anchor format "${args}"`);
        return [(a1 | a2).toString(), false];
    },
    "geo": (args) => {
        const [val, offset] = args;
        let o: string, lazy: boolean;
        if (offset) {
            [o, lazy] = offset[0] === "@" ? parseHelper(offset) : [offset, false];
        }
        return [
            `{ value: ${val}, unit: 1, offset: ${o || "0"} }`,
            lazy,
        ];
    },
};

function checkNameIsScale(name: string) {
    if (name !== "xScale" && name !== "yScale") {
        throw new Error(`@scale helpers should only be used with xScale and yScale.`);
    }
}

export function parseHelper(expr: string) {
    const [_, hName, hArg] = expr.match(HELPER);
    return parseHelper_(hName, hArg.split(","));
}

export function parseHelper_(hName: string, hArg: string[]) {
    if (hName in exprHelpers) {
        return exprHelpers[hName].call(null, hArg.map(x => x.trim()));
    } else {
        throw new Error(`Unknown helper @${hName}`);
    }
}
