import { oneLineTrim } from "common-tags";
import { ASTNodeComp } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { NAME } from "../tokens";
import { transformHelper } from "./helper";

export function parseProp(p: ParserStream, node: ASTNodeComp) {
    const name = p.expect(NAME)[0];
    p.skipSpaces();
    p.expect("=");
    p.skipSpaces();

    parseExpr(node, name, consumeExpr(p));
}

export function consumeExpr(p): string {
    let leftBracketCount = 0;
    let leftBracketCount2 = 0;
    let leftBracketCount3 = 0;
    const expr = p.consume(ch => {
        switch (ch) {
            case ";":
                if (leftBracketCount > 0) p._error(`Unbalanced brackets: "}" expected.`);
                return [true, true];
            case "\n":
                if (leftBracketCount > 0 || leftBracketCount2 > 0 || leftBracketCount3 > 0) return [false, false];
                return [true, true];
            case "{":
                leftBracketCount ++; break;
            case "}":
                if (leftBracketCount > 0) { leftBracketCount --; break; }
                return [true, false];
            case "[":
                leftBracketCount2++; break;
            case "]":
                leftBracketCount2--; break;
            case "(":
                leftBracketCount3++; break;
            case ")":
                leftBracketCount3--; break;
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
        node.props.push({ name, expr: expr.indexOf("@") >= 0 ? replaceHelpers(expr) : expr });
    }
}

function replaceHelpers(expr: string) {
    let lazy = false;
    const replaced = expr.replace(/@([\w\d_\-]*)\(/g, (str, name) => {
        const [t, lazy_] = transformHelper(name);
        lazy = lazy || lazy_;
        return t;
    });
    return lazy ?
        oneLineTrim`(function() {
            var f = function() { return ${replaced} };
            f.__internal__ = true; return f;
        })()` :
        replaced;
}
