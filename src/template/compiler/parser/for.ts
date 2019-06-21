import { ASTNodeFor } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { FOR_EXPR, NAME } from "../tokens";
import { parseBlockBody } from "./block-body";

export function parseFor(p: ParserStream): ASTNodeFor {
    p.expect("@for");
    p.skipSpaces();

    let withIndex: boolean;
    if (withIndex = p.peek() === "(") {
        p.advance(1);
    }

    let forIndex: string = "";
    const forName = p.expect(NAME, `entry name`)[0];
    p.skipSpaces();

    if (withIndex) {
        p.expect(",");
        p.skipSpaces();
        forIndex = p.expect(NAME, `index name`)[0];
        p.skipSpaces();
        p.expect("\\)");
        p.skipSpaces();
    }

    p.expect("in");
    p.skipSpaces();
    const expr = p.expect(FOR_EXPR, `the data to be iterated`)[0];
    p.skipSpaces();

    const node: ASTNodeFor = {
        type: "op-for",
        forName,
        expr,
        localData: [],
        children: [],
        namedChildren: {},
    };

    if (withIndex) {
        node.forIndex = forIndex;
    }

    parseBlockBody(p, node);
    return node;
}
