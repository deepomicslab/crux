import { ASTNode, ASTNodeComp } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { NAME } from "../tokens";
import { consumeExpr, replaceHelpers } from "./prop";

export function parseLet(p: ParserStream, node: ASTNode): { name: string, expr: string } {
    p.expect("@let");
    p.skipSpaces();
    const name = p.expect(NAME)[0];
    p.skipSpaces();
    p.expect("=");
    p.skipSpaces();
    let expr = consumeExpr(p);
    if (expr.indexOf("@") >= 0) {
        const [expr_, lazy] = replaceHelpers(expr);
        expr = expr_;
        if (lazy && node.type === "comp") {
            (node as ASTNodeComp).isLazy = true;
            // throw new Error(`@let with helpers can only appear inside commponent blocks`);
        }
    }
    return { name, expr };
}
