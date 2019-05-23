import { ASTNodeYield } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { FOR_EXPR, NAME } from "../tokens";

export function parseYield(p: ParserStream): ASTNodeYield {
    p.expect("@yield");
    p.skipSpaces();
    const name = p.expect(NAME)[0];
    p.skipSpaces();
    let expr: string = null;
    if (p.peek(4) === "with") {
        p.expect("with");
        p.skipSpaces();
        expr = p.expect(FOR_EXPR)[0];
    }
    let processor = null;
    if (p.peek(4) === "then") {
        p.expect("then");
        p.skipSpaces();
        processor = p.expect(FOR_EXPR)[0];
    }
    return {
        type: "yield",
        name,
        data: expr,
        processor,
        localData: [],
        children: [],
        namedChildren: {},
    };
}
