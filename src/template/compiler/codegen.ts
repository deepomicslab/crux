import { oneLineTrim, stripIndent } from "common-tags";
import { Anchor, GEOMETRY_LITERAL } from "../../defs/geometry";
import { getComponent } from "../../element/get-component";
import { UIDGenerator } from "../../utils/uid";
import { ASTNode, ASTNodeComp, ASTNodeCondition, ASTNodeElse, ASTNodeFor, ASTNodeIf, ASTNodeYield, isRootElement, newNode } from "./ast-node";
import { Component } from "../../element/component";

function wrappedWithLocalData(node: ASTNode, wrapped: string) {
    return `(function(){
        ${genLocalData(node)}
        return ${wrapped};
    })()`;
}

function genLocalData(node: ASTNode) {
    return node.localData.map(d =>
        d.name === "@expr" ? `${d.expr};` : `let ${d.name} = ${d.expr};`,
    ).join(" ");
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
    const attrs = node.props.map(p => {
        let match: RegExpMatchArray;
        const name = p.name;
        const expr = (match = p.expr.match(GEOMETRY_LITERAL)) ?
            genGeoExpr(match) : p.expr;
        return `'${name}': ${genExpr(expr, name)}`;
    }).join(", ");
    return `props: { ${attrs} },`;
}

function genEventHdl(node: ASTNodeComp) {
    if (node.on.length === 0) return "";
    const events = node.on.map(o => {
        let handler: string;
        if (o.handler.startsWith("function") || o.handler.match(/^\(.+?\) *=>/)) {
            handler = o.handler;
        } else if (o.handler.match(/^[A-z0-9_]+$/)) {
            handler = `${o.handler}.bind(this)`;
        } else {
            handler = `(function($ev, $el) { ${o.handler} }).bind(this)`;
        }
        return `${o.name}: ${handler}`;
    }).join(",");
    return `on: { ${events} },`;
}

function genStyle(node: ASTNodeComp) {
    if (node.styles.length === 0) return "";
    const styles = node.styles.map(s => `'${s.name}': ${s.expr}`).join(",");
    return `styles: { ${styles} },`;
}

function genBehavior(node: ASTNodeComp) {
    if (node.behavior.length === 0) return "";
    const behaviors = node.behavior.map(s => `'${s.name}': {${
        s.args.map(a => `${a.name}: ${a.expr}`).join(", ")
    }}`).join(",");
    return `behaviors: { ${behaviors} },`;
}

function genStage(node: ASTNodeComp) {
    if (node.stage.length === 0) return "";
    const stages = node.stage.map(s => `'${s.name}': {${
        s.args.map(a => `${a.name}: ${a.expr}`).join(", ")
    }}`).join(",");
    return `stages: { ${stages} },`;
}

function genNamedChildren(node: ASTNodeComp, uidGen: UIDGenerator) {
    const keys = Object.keys(node.namedChildren);
    if (keys.length === 0) return "";
    const str = keys.map(k => {
        const nc = node.namedChildren[k];
        const func = stripIndent`
        function (${nc.dataName || ""}) { return [ ${genChildren(nc, uidGen)} ] }
        `;
        return `${k}: ${func},`;
    }).join("");
    return `namedChildren: { ${str} },`;
}

function gatherCondBlocks(node: ASTNode) {
    if (node.type === "children") return;
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

function genChildren(node: ASTNode, uidGen: UIDGenerator): string {
    return node.children.map(n => node2code(n, uidGen)).join(",");
}

// nodes

function genNodeComp(node: ASTNodeComp, uidGen: UIDGenerator) {
    const hasLocalData = node.localData.length > 0;
    const n = node as ASTNodeComp;
    const str = isRootElement(node) ?
        genChildren(node, uidGen) :
        stripIndent`
        _c("${n.name}",
            {
                id: ${uidGen.gen()},
                ${[
                    genAttrs(n),
                    genEventHdl(n),
                    genStyle(n),
                    genBehavior(n),
                    genStage(n),
                    genNamedChildren(n, uidGen),
                ].filter(s => s).join("\n")}
            },
            [ ${genChildren(node, uidGen)} ])`;
    return hasLocalData ? wrappedWithLocalData(node, str) : str;
}

function genNodeFor(node: ASTNodeFor, uidGen: UIDGenerator) {
    const hasLocalData = node.localData.length > 0;
    const { forName, forIndex, expr } = node;
    const args = forIndex ? `${forName}, ${forIndex}` : forName;
    return stripIndent`
    _l(${expr}, function(${args}) {
        ${hasLocalData ? genLocalData(node) : ""}
        return [ ${genChildren(node, uidGen)} ];
    })`;
}

function genNodeCond(node: ASTNodeCondition, uidGen: UIDGenerator) {
    const nodes = node.children;
    return nodes.map((n: ASTNodeIf, i) => {
        const isLast = i === nodes.length - 1;
        const hasLocalData = n.localData.length > 0;
        const str = genChildren(n, uidGen);
        const childrenStr = hasLocalData ? wrappedWithLocalData(n, str) : str;
        if (n.condition) {
            return `${n.condition} ? ${childrenStr} : ${isLast ? "null" : ""}`;
        } else {
            return childrenStr;
        }
    }).join("");
}

function genNodeYield(node: ASTNodeYield, uidGen: UIDGenerator) {
    const data = node.data || "";
    const str = node.name === "children" ?
        `(prop.namedChildren.children ?
            prop.namedChildren.children(${data}) :
            prop.children.length === 0 ? [${genChildren(node, uidGen)}] : prop.children)` :
        `(prop.namedChildren["${node.name}"] ? prop.namedChildren["${node.name}"](${data}) : [${genChildren(node, uidGen)}])`;
    return node.processor ? `${node.processor}${str}` : str;
}

function node2code(node: ASTNode, uidGen: UIDGenerator): string {
    gatherCondBlocks(node);

    switch (node.type) {
        case "comp":
            return genNodeComp(node as ASTNodeComp, uidGen);
        case "op-for":
            return genNodeFor(node as ASTNodeFor, uidGen);
        case "cond":
            return genNodeCond(node as ASTNodeCondition, uidGen);
        case "yield":
            return genNodeYield(node as ASTNodeYield, uidGen);
    }
}

export function gencode(ast: ASTNode): string {
    return stripIndent`
    with (this) {
        return ${node2code(ast, new UIDGenerator())};
    }`;
}
