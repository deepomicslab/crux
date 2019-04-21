import { ASTNodeComp } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { NAME } from "../tokens";

export function parseProp(p: ParserStream, node: ASTNodeComp) {
    const name = p.expect(NAME)[0];
    p.skipSpaces();
    p.expect("=");
    p.skipSpaces();
    const expr = p.consume(ch => {
        if (ch === "\n" || ch === ";") return [true, true];
        if (ch === "}") return [true, false];
        return [false, false];
    }, "property expression");
    node.props.push({ name, expr });
}
