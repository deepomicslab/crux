import { oneLineTrim } from "common-tags";
import { ASTNodeComp } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { PROP_NAME } from "../tokens";
import { transformHelper } from "./helper";

export function parseProp(p: ParserStream, node: ASTNodeComp) {
    const name = p.expect(PROP_NAME, "prop name")[0];
    p.skipSpaces();
    p.expect("=");
    p.skipSpaces();

    parseExpr(node, name, consumeExpr(p));
}

export function consumeExpr(p: ParserStream): string {
    let leftBracketCount = 0;
    let leftBracketCount2 = 0;
    let leftBracketCount3 = 0;
    const expr = p.consume((ch: string) => {
        switch (ch) {
            case ";":
                if (leftBracketCount > 0) p._error(`Unbalanced brackets: "}" expected.`);
                return [true, true];
            case "\n":
                if (leftBracketCount > 0 || leftBracketCount2 > 0 || leftBracketCount3 > 0) return [false, false];
                return [true, true];
            case "{":
                leftBracketCount++;
                break;
            case "}":
                if (leftBracketCount > 0) {
                    leftBracketCount--;
                    break;
                }
                return [true, false];
            case "[":
                leftBracketCount2++;
                break;
            case "]":
                leftBracketCount2--;
                break;
            case "(":
                leftBracketCount3++;
                break;
            case ")":
                leftBracketCount3--;
                break;
        }
        return [false, false];
    }, "property expression");
    return expr.replace("\n", "");
}

export function parseExpr(node: ASTNodeComp, name: string, expr: string) {
    if (name.startsWith("on:")) {
        const eventName = name.slice(3);
        node.on.push({ name: eventName, handler: expr });
    } else if (name.startsWith("style:")) {
        const styleName = name.slice(6);
        node.styles.push({ name: styleName, expr });
    } else {
        if (expr.indexOf("@") >= 0) {
            expr = replacePropHelpers(expr);
        }
        if (name.indexOf(".") > 0) {
            const [delegateName, propName] = name.split(".");
            node.props.push({ delegate: delegateName, name: propName, expr });
        } else if (name === "key") {
            node.key = expr;
        } else {
            node.props.push({ name, expr });
            if (name === "static") {
                node.staticVal = expr;
            }
        }
    }
}

function replacePropHelpers(expr: string) {
    const [replaced, lazy] = replaceHelpers(expr);
    return lazy ? oneLineTrim`_i(function() { return ${replaced} })` : replaced;
}

export function replaceHelpers(expr: string): [string, boolean] {
    let lazy = false;
    const replaced = expr.replace(/@([\w\d_\-]*)\(/g, (str, name) => {
        const [t, lazy_] = transformHelper(name);
        if (lazy_) lazy = true;
        return t;
    });
    return [replaced, lazy];
}
