import { ASTNode, ASTNodeComp } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { parseBlockBody } from "../parser/block-body";
import { BLOCK_NAME } from "../tokens";

export function parseBlock(p: ParserStream): ASTNode {
    const [_, name, initArg] = p.expect(BLOCK_NAME);

    const node: ASTNodeComp = {
        type: "comp",
        name,
        localData: [],
        children: [],
        namedChildren: {},
        props: [],
        on: [],
        styles: [],
        behavior: [],
    };

    if (initArg) {
        node.props.push({ name: "_initArg", expr: initArg });
    }

    p.skipSpaces(true);
    parseBlockBody(p, node);
    p.skipSpaces(true);

    return node;
}
