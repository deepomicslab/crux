import { ASTNodeComp } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { NAME } from "../tokens";
import { parseHelper_ } from "./helper";

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
        node.props.push({ name, expr: expr.indexOf("@") >= 0 ? parseHelper(expr) : expr });
    }
}

function parseHelper(expr: string) {
    let lazy = false;
    let replaced = "";
    const p = new ParserStream(expr);

    while (true) {
        replaced += p.consumeTill("@", false, false);
        if (p.eof()) break;
        const [s, l] = parseNestedHelper(p);
        replaced += s;
        lazy = lazy || l;
        if (p.eof()) break;
    }
    return lazy ?
        `(function() { var f = function() { return ${replaced} }; f.__internal__ = true; return f; })()` :
        replaced;
}

function parseNestedHelper(p: ParserStream): [string, boolean] {
    let lazy = false;

    p.expect("@");
    const name = p.expect(NAME, "helper name")[0];
    p.expect("\\(");

    const hArgs = [];
    let buffer = "";
    let ended = false;

    p.consumeSync((ch) => {
        if (ch === ")") {
            ended = true;
            return [true, true];
        }
        if (ch === "@") {
            const [s, l] = parseNestedHelper(p);
            buffer += s;
            lazy = lazy || l;
            return [false, false];
        }
        if (ch === ",") {
            hArgs.push(buffer.trim());
            buffer = "";
        } else {
            buffer += ch;
        }
        return [false, true];
    }, "helper");

    hArgs.push(buffer.trim());

    if (!ended) {
        throw new Error(`Helper definition is not ended.`);
    }
    const [s, l] = parseHelper_(name, hArgs.filter(x => x));
    return [s, l || lazy];
}
