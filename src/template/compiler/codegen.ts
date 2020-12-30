import { oneLineTrim } from "common-tags";
import { GEOMETRY_LITERAL } from "../../defs/geometry";
import { UIDGenerator } from "../../utils/uid";
import {
    ASTNode,
    ASTNodeComp,
    ASTNodeCondition,
    ASTNodeElse,
    ASTNodeFor,
    ASTNodeIf,
    ASTNodeYield,
    isRootElement,
    newNode,
} from "./ast-node";

const indent = "    ";

function t(str: string): string {
    return indent + str.replace(/\n/g, `\n${indent}`);
}

function serialize(obj: any): string {
    if (typeof obj === "object")
        return `{${Object.keys(obj)
            .map(k => `'${k}': ${serialize(obj[k])}`)
            .join(",")}}`;
    return obj.toString();
}

function wrappedWithLocalData(node: ASTNode, wrapped: string) {
    return `(function() { ${genLocalData(node)} return (\n${wrapped})})()`;
}

function genLocalData(node: ASTNode) {
    return node.localData.map(d => (d.name === "@expr" ? `${d.expr};` : `let ${d.name} = ${d.expr};`)).join("");
}

function genGeoExpr(match: RegExpMatchArray): string {
    // (100), 100, +, (1), 1
    const value = match[2] || match[1];
    const offset = (match[3] === "-" ? "-" : "") + (match[5] || match[4] || "0");
    return oneLineTrim`{
        value: ${value},
        unit: 1,
        offset: ${offset},
    }`;
}

function genExpr(expr: string, name: string) {
    // wip
    return expr;
}

function genAttrs(node: ASTNodeComp) {
    const attrStrings: string[] = [];
    const normalProps = [];
    const delegates: Record<string, any> = {};
    let hasDelegate = false;
    for (const p of node.props) {
        if (p.delegate) {
            const m = p.delegate.match(/(.+?)\(:(.+?)\)/);
            if (m) {
                if (!delegates[m[1]]) delegates[m[1]] = {};
                const d = delegates[m[1]];
                if (!d._stages) d._stages = { [m[2]]: {} };
                d._stages[m[2]][p.name] = p.expr;
            } else {
                if (!delegates[p.delegate]) delegates[p.delegate] = {};
                const d = delegates[p.delegate];
                if (p.name.startsWith("on:")) {
                    const eventName = p.name.substr(3);
                    if (!d._on) d._on = {};
                    d._on[eventName] = genEventListener(p.expr);
                } else if (p.name.startsWith("behavior:")) {
                    const bName = p.name.substr(9);
                    if (!d._behavior) d._behavior = {};
                    d._behavior[bName] = p.expr;
                } else {
                    d[p.name] = p.expr;
                }
            }
            hasDelegate = true;
        } else {
            normalProps.push(p);
        }
    }
    for (const p of normalProps) {
        const name = p.name;
        if (name === "__dynamic__") {
            attrStrings.push(`...${p.expr}`);
            continue;
        }
        let match: RegExpMatchArray | null;
        const expr = (match = p.expr.match(GEOMETRY_LITERAL)) ? genGeoExpr(match) : p.expr;
        attrStrings.push(`'${name}': ${genExpr(expr, name)}`);
    }
    if (hasDelegate) {
        attrStrings.push(`opt: ${serialize(delegates)}`);
    }
    if (node.initArg && node.name !== "Component") {
        attrStrings.push(`_initArg: ${node.initArg}`);
    }
    return `props: {${attrStrings.join(",")}},`;
}

const EVT_FUNC_CALL = new RegExp("^([A-z0-9_]+)\\((.+?)\\)$");

function genEventListener(handler: string): string {
    let match: any;
    if (handler.startsWith("function") || handler.match(/^\(.+?\) *=>/) || handler[0] === "[" || handler[0] === "@") {
        return handler;
    } else if (handler.match(/^[A-z0-9_]+$/)) {
        return `_b(${handler})`;
    } else if ((match = handler.match(EVT_FUNC_CALL))) {
        return `_b(${match[1]}, ${match[2]})`;
    } else {
        return `(function($ev, $el) { ${handler} }).bind(this)`;
    }
}

function genEventHdl(node: ASTNodeComp) {
    if (node.on.length === 0) return "";
    const events = node.on.map(o => `${o.name}: ${genEventListener(o.handler)}`).join(",");
    return `on: { ${events} },`;
}

function genStyle(node: ASTNodeComp) {
    if (node.styles.length === 0) return "";
    const styles = node.styles.map(s => `'${s.name}': ${s.expr}`).join(",");
    return `styles: { ${styles} },`;
}

function genBehavior(node: ASTNodeComp) {
    if (node.behavior.length === 0) return "";
    const behaviors = node.behavior
        .map(s => `'${s.name}': {${s.args.map(a => `${a.name}: ${a.expr}`).join(", ")}}`)
        .join(",");
    return `behaviors: { ${behaviors} },`;
}

function genStage(node: ASTNodeComp) {
    if (node.stage.length === 0) return "";
    const stages = node.stage
        .map(s => `'${s.name}': {${s.args.map(a => `${a.name}: ${a.expr}`).join(", ")}}`)
        .join(",");
    return `stages: { ${stages} },`;
}

function genNamedChildren(node: ASTNodeComp, u: UIDGenerator) {
    const keys = Object.keys(node.namedChildren);
    if (keys.length === 0) return "";
    const str = keys
        .map(k => {
            const nc = node.namedChildren[k];
            const children = genChildren(nc, u);
            const func = Array.isArray(nc.dataName)
                ? `function ($data) { ${nc.dataName
                      .map(n => `const ${n} = $data['${n}'];`)
                      .join("")} return [\n${children}];}`
                : `function (${nc.dataName || ""}) { return [${children}] }`;
            return `${k}: ${func},`;
        })
        .join("");
    return t(`\nnamedChildren: {\n${t(str)}},`);
}

function gatherCondBlocks(node: ASTNode) {
    // if (node.type === "children") return;
    if (node.type === "cond" || !node.children.some(c => c.type === "op-if")) {
        return;
    }
    const newChildren = [];
    let inCondBlock = false;
    const newCondNode = () => newNode<ASTNodeCondition>("cond");

    let currCondition = newCondNode();

    for (const child of node.children) {
        switch (child.type) {
            case "op-if":
                if (inCondBlock) {
                    newChildren.push(currCondition);
                    currCondition = newCondNode();
                }
                inCondBlock = true;
                currCondition.children.push(child as ASTNodeIf);
                break;
            case "op-else":
            case "op-elsif":
                currCondition.children.push(child as ASTNodeElse);
                break;
            default:
                if (inCondBlock) {
                    newChildren.push(currCondition);
                    currCondition = newCondNode();
                    inCondBlock = false;
                }
                newChildren.push(child);
        }
    }

    if (inCondBlock) newChildren.push(currCondition);
    node.children = newChildren;
}

function genChildren(node: ASTNode, u: UIDGenerator): string {
    gatherCondBlocks(node);
    return node.children.map(n => node2code(n, u)).join(",\n");
}

// nodes

function genNodeComp(node: ASTNodeComp, u: UIDGenerator) {
    const hasLocalData = node.localData.length > 0;
    const n = node as ASTNodeComp;
    const tag = n.name === "Component" && n.initArg ? n.initArg : `"${n.name}"`;
    const noKey = n.key === undefined;
    const key = noKey ? `'${u.gen()}$'` : n.key;
    const useAutoKey = noKey && u.inList();
    u.enterComponent();
    let str: string;
    if (isRootElement(node)) {
        str = genChildren(node, u);
    } else {
        const i =
            `{` +
            [genAttrs(n), genEventHdl(n), genStyle(n), genBehavior(n), genStage(n), genNamedChildren(n, u)]
                .filter(s => s)
                .join(" ")
                // remove the last comma
                .slice(0, -1) +
            `},[\n` +
            genChildren(node, u) +
            `]`;
        if (n.isLazy || n.staticVal) {
            const ld = genLocalData(node);
            str = `_z(${tag}, ${key}, ${useAutoKey}, ${n.staticVal}, function() { ${ld} return [${i}]})`;
        } else {
            str = `_c(${tag}, ${key}, ${useAutoKey}, ${i})`;
        }
    }
    u.exitComponent();
    return t(hasLocalData && !node.isLazy ? wrappedWithLocalData(node, str) : str);
}

function genNodeFor(node: ASTNodeFor, u: UIDGenerator) {
    const hasLocalData = node.localData.length > 0;
    const { forName, forIndex, expr } = node;
    const args = forIndex ? `${forName}, ${forIndex}` : forName;
    const notInLoop = !u.inList();
    u.enterLoop();
    const result =
        `_l(${expr}, function(${args}) {` +
        (hasLocalData ? genLocalData(node) : "") +
        ` return [\n${genChildren(node, u)}];
    }, ${notInLoop})`;
    u.exitLoop();
    return t(result);
}

function genNodeCond(node: ASTNodeCondition, u: UIDGenerator) {
    const nodes = node.children;
    const result = nodes
        .map((n, i) => {
            const isLast = i === nodes.length - 1;
            const hasLocalData = n.localData.length > 0;
            const str = `[\n${genChildren(n, u)}\n]`;
            const childrenStr = hasLocalData ? wrappedWithLocalData(n, str) : str;
            if ("condition" in n) {
                return `${n.condition} ? ${childrenStr} : ${isLast ? "null" : ""}`;
            } else {
                return childrenStr;
            }
        })
        .join("");
    return t(result);
}

function genNodeYield(node: ASTNodeYield, u: UIDGenerator) {
    const data = node.data || "undefined";
    const children = genChildren(node, u);
    const str = `_y(prop, "${node.name}", ${data}, [\n${children}])`;
    return t(node.processor ? `${node.processor}(${str})` : str);
}

function node2code(node: ASTNode, u: UIDGenerator): string {
    gatherCondBlocks(node);

    switch (node.type) {
        case "comp":
            return genNodeComp(node as ASTNodeComp, u);
        case "op-for":
            return genNodeFor(node as ASTNodeFor, u);
        case "cond":
            return genNodeCond(node as ASTNodeCondition, u);
        case "yield":
            return genNodeYield(node as ASTNodeYield, u);
        default:
            throw Error(`Internal error: Unknown node type when generating code: ${node.type}`);
    }
}

export function gencode(ast: ASTNode): string {
    return `with (this) { return (\n${node2code(ast, new UIDGenerator())})}`;
}
