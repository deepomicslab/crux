import { ASTNodeYield } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { FOR_EXPR, NAME } from "../tokens";
import { parseBlockBody } from "./block-body";

export function parseYield(p: ParserStream): ASTNodeYield {
    p.expect("@yield");
    p.skipSpaces();
    const name = p.expect(NAME, "child name")[0];
    p.skipSpaces();
    let expr = "";
    if (p.peek(4) === "with") {
        p.expect("with");
        p.skipSpaces();
        if (p.peek() === "{") {
            expr = p.consumeTill("}", true) + "}";
        } else {
            expr = p.expect(FOR_EXPR, "data name")[0];
        }
    }
    p.skipSpaces();
    let processor = "";
    if (p.peek(4) === "then") {
        p.expect("then");
        p.skipSpaces();
        processor = p.expect(FOR_EXPR, "processor name")[0];
    }
    p.skipSpaces();

    const node: ASTNodeYield = {
        type: "yield",
        name,
        data: expr,
        processor,
        localData: [],
        children: [],
        namedChildren: {},
    };

    if (p.peek(7) === "default") {
        p.expect("default");
        p.skipSpaces();
        parseBlockBody(p, node);
    }

    return node;
}
