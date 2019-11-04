import { ASTNode, newCompNode } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { parseBlockBody } from "../parser/block-body";
import { BLOCK_NAME } from "../tokens";
import { parseModifiers } from "./modifier";

export function parseBlock(p: ParserStream): ASTNode {
    const [, name, modifiers, initArg] = p.expect(BLOCK_NAME, "block name");

    const node = newCompNode(name);

    if (initArg) {
        node.initArg = initArg;
    }
    if (modifiers) {
        parseModifiers(node, modifiers);
    }

    p.skipSpaces(false);
    if (p.peek() === ";") {
        p.expect(";");
        p.skipSpaces(true);
        return node;
    }

    p.skipSpaces(true);
    parseBlockBody(p, node);
    p.skipSpaces(true);

    return node;
}
