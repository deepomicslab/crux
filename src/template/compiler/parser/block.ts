import { ASTNode, ASTNodeComp } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { parseBlockBody } from "../parser/block-body";
import { BLOCK_NAME } from "../tokens";

export function parseBlock(p: ParserStream): ASTNode {
    const name = p.expect(BLOCK_NAME)[0];

    const node: ASTNodeComp = {
        type: "comp",
        name,
        localData: [],
        children: [],
        props: [],
    };

    p.skipSpaces(true);
    parseBlockBody(p, node);
    p.skipSpaces(true);

    return node;
}
