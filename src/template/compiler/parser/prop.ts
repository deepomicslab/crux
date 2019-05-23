import { ASTNodeComp } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { NAME } from "../tokens";
import { parseHelper_ } from "./helper";

export function parseProp(p: ParserStream, node: ASTNodeComp) {
    const name = p.expect(NAME)[0];
    p.skipSpaces();
    p.expect("=");
    p.skipSpaces();

    let leftBracketCount = 0;
    let expr = p.consume(ch => {
        if (ch === "\n" || ch === ";") return [true, true];
        if (ch === "{") leftBracketCount ++;
        if (ch === "}") {
            if (leftBracketCount > 0) leftBracketCount --;
            else return [true, false];
        }
        return [false, false];
    }, "property expression");

    if (name.startsWith("on:")) {
        const eventName = name.slice(3);
        node.on.push({ name: eventName, handler: expr });
    } else if (name.startsWith("style:")) {
        const styleName = name.slice(6);
        node.styles.push({ name: styleName, expr });
    } else {
        if (expr.indexOf("@") >= 0) {
            expr = parseExpr(expr);
        }
        node.props.push({ name, expr });
    }

}

function parseExpr(expr: string) {
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
