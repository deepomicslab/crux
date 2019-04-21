import { oneLineTrim, stripIndent } from "common-tags";
import { GEOMETRY_LITERAL } from "../../defs/geometry";
import { getComponent } from "../../element/get-component";
import { UIDGenerator } from "../../utils/uid";
import { ASTNode, ASTNodeComp, ASTNodeCondition, ASTNodeElse, ASTNodeFor, ASTNodeIf, newNode, isRootElement } from "./ast-node";

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
    const offset = match[3] === "-" ? "-" : "" + (match[5] || match[4] || "0");
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
    const geoProps = getComponent(node.name).$geometryProps.flat(1);
    const attrs = node.props.map(p => {
        const isGeoProp = geoProps.includes(p.name);
        let match: RegExpMatchArray;
        const expr = isGeoProp && (match = p.expr.match(GEOMETRY_LITERAL)) ?
            genGeoExpr(match) : p.expr;
        return `'${p.name}': ${genExpr(expr, p.name)}`;
    }).join(", ");
    return `{ ${attrs} }`;
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
            str = isRootElement(node) ?
                genChildren(node, uidGen) :
                stripIndent`
                _c("${(node as ASTNodeComp).name}",
                    {
                        props: ${genAttrs(node as ASTNodeComp)},
                        uid: ${uidGen.gen()},
                    },
                    [ ${genChildren(node, uidGen)} ])`;
            return hasLocalData ? wrappedWithLocalData(node, str) : str;
        case "op-for":
            const { forName, forIndex, expr } = node as ASTNodeFor;
            return stripIndent`
            _l(${expr}, function(${forName}, ${forIndex}) {
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
