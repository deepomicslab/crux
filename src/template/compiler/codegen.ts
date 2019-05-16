import { oneLineTrim, stripIndent } from "common-tags";
import { Anchor, GEOMETRY_LITERAL } from "../../defs/geometry";
import { getComponent } from "../../element/get-component";
import { UIDGenerator } from "../../utils/uid";
import { ASTNode, ASTNodeComp, ASTNodeCondition, ASTNodeElse, ASTNodeFor, ASTNodeIf, isRootElement, newNode } from "./ast-node";

function wrappedWithLocalData(node: ASTNode, wrapped: string) {
    return `(function(){
        ${genLocalData(node)}
        return ${wrapped};
    })()`;
}

function genLocalData(node: ASTNode) {
    return node.localData.map(d => `let ${d.name} = ${d.expr}; `).join("");
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
    const component = getComponent(node.name);
    const geoProps = component.$geometryProps.flat(1);
    const initArgPropName = component.propNameForInitializer();
    const attrs = node.props.map(p => {
        let match: RegExpMatchArray;
        // replace _initArg
        const name = p.name === "_initArg" ? initArgPropName : p.name;
        const isGeoProp = geoProps.includes(p.name);
        const expr = isGeoProp && (match = p.expr.match(GEOMETRY_LITERAL)) ?
            genGeoExpr(match) : p.expr;
        return `'${name}': ${genExpr(expr, name)}`;
    }).join(", ");
    return `props: { ${attrs} },`;
}

function genEventHdl(node: ASTNodeComp) {
    if (node.on.length === 0) return "";
    const events = node.on.map(o => {
        let handler: string;
        if (o.handler.match(/^[A-z0-9_]+$/)) {
            handler = `${o.handler}.bind(this)`;
        } else {
            handler = `(function($ev) { ${o.handler} }).bind(this)`;
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

function gatherCondBlocks(node: ASTNode) {
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

function node2code(node: ASTNode, uidGen: UIDGenerator): string {
    gatherCondBlocks(node);

    const hasLocalData = node.localData.length > 0;
    let str: string;
    switch (node.type) {
        case "comp":
            const n = node as ASTNodeComp;
            str = isRootElement(node) ?
                genChildren(node, uidGen) :
                stripIndent`
                _c("${n.name}",
                    {
                        id: ${uidGen.gen()},
                        ${genAttrs(n)}
                        ${genEventHdl(n)}
                        ${genStyle(n)}
                        ${genBehavior(n)}
                    },
                    [ ${genChildren(node, uidGen)} ])`;
            return hasLocalData ? wrappedWithLocalData(node, str) : str;
        case "op-for":
            const { forName, forIndex, expr } = node as ASTNodeFor;
            const args = forIndex ? `${forName}, ${forIndex}` : forName;
            return stripIndent`
            _l(${expr}, function(${args}) {
                ${hasLocalData ? genLocalData(node) : ""}
                return [ ${genChildren(node, uidGen)} ];
            })`;
        case "cond":
            const nodes = (node as ASTNodeCondition).children;
            return nodes.map((n: ASTNodeIf, i) => {
                const isLast = i === nodes.length - 1;
                if (n.condition) {
                    return `${n.condition} ? ${genChildren(n, uidGen)} : ${isLast ? "null" : ""}`;
                } else {
                    return genChildren(n, uidGen);
                }
            }).join("");
    }
}

export function gencode(ast: ASTNode): string {
    return stripIndent`
    with (this) {
        return ${node2code(ast, new UIDGenerator())};
    }`;
}
