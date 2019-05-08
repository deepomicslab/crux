import { Anchor } from "../../../defs/geometry";
import { rad2Deg } from "../../../utils/math";
import { ASTNodeComp } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { HELPER, NAME } from "../tokens";

const ANCHOR_LIST = {
    top: Anchor.Top,
    middle: Anchor.Middle,
    bottom: Anchor.Bottom,
    left: Anchor.Left,
    center: Anchor.Center,
    right: Anchor.Right,
};


const exprHelpers: Record<string, (name: string, args: string[]) => string> = {
    "scale-linear": (name, args) => {
        checkNameIsScale(name);
        const horizontal = name === "xScale";
        const domain = `[${args[0]}, ${args[1]}]`;
        const range = args.length === 4 ? `[${args[2]}, ${args[3]}]` : "null";
        return `{
            __scale__: true,
            type: "linear",
            domain: ${domain},
            range: ${range},
        }`;
    },
    "scaled": (name, args) => {
        const horizontal = true;
        return `{ __internal__: true, name: "_scale", args: [${args[0]}, ${horizontal}] }`;
    },
    "clip": (name, args) => {
        if (args[0] !== "bound") {
            throw new Error(`Unknown clip path type "${args[0]}`);
        }
        return `{ type: "${args[0]}", inset: 0, rx: ${args[1] || 0}, ry: ${args[2] || 0} }`;
    },
    "rotate": (name, args) => {
        const angle = parseInt(args[0].slice(0, -3));
        const unit = args[0].slice(-3);
        const value = unit === "rad" ? rad2Deg(angle) : angle;
        return `{ __internal__: true, name: "_rotate", args: [${value}]}`;
    },
    "anchor": (name, args) => {
        const [a1, a2] = args.map(x => ANCHOR_LIST[x]);
        if (!a1 || ! a2)
            throw Error(`Wrong anchor format "${args}"`);
        return (a1 | a2).toString();
    },
};

function checkNameIsScale(name: string) {
    if (name !== "xScale" && name !== "yScale") {
        throw new Error(`@scale helpers should only be used with xScale and yScale.`);
    }
}

export function parseProp(p: ParserStream, node: ASTNodeComp) {
    const name = p.expect(NAME)[0];
    p.skipSpaces();
    p.expect("=");
    p.skipSpaces();
    let expr = p.consume(ch => {
        if (ch === "\n" || ch === ";") return [true, true];
        if (ch === "}") return [true, false];
        return [false, false];
    }, "property expression");

    if (name.startsWith("on:")) {
        const eventName = name.slice(3);
        node.on.push({ name: eventName, handler: expr });
    } else if (name.startsWith("style:")) {
        const styleName = name.slice(6);
        node.styles.push({ name: styleName, expr });
    } else {
        if (expr[0] === "@") {
            const [_, hName, hArg] = expr.match(HELPER);
            if (hName in exprHelpers) {
                expr = exprHelpers[hName].call(null, name, hArg.split(",").map(x => x.trim()));
            } else {
                throw new Error(`Unknown helper @${hName}`);
            }
        }
        node.props.push({ name, expr });
    }

}
