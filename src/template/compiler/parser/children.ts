import { ASTNodeChildren } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { NAME } from "../tokens";
import { parseBlockBody } from "./block-body";

export function parseChildren(p: ParserStream): ASTNodeChildren {
    p.expect(":");
    const name = p.expect(NAME)[0];
    p.skipSpaces();
    let dataName = null;
    if (p.peek() === "(") {
        p.expect("\\(");
        dataName = p.expect(NAME, "attached data");
        p.expect("\\)");
    }
    p.skipSpaces();
    const block: ASTNodeChildren = {
        type: "children",
        name,
        dataName,
        localData: [],
        children: [],
        namedChildren: {},
    };
    parseBlockBody(p, block);
    return block;
}
