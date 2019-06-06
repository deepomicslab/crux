import { ASTNode, ASTNodeElse, ASTNodeElsif, ASTNodeIf } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { parseBlockBody } from "./block-body";

export function parseIf(p: ParserStream): ASTNodeIf {
    return parseIfBlocks<ASTNodeIf>(p, "@if", "op-if", true);
}

export function parseElsif(p: ParserStream): ASTNodeElsif {
    return parseIfBlocks<ASTNodeElsif>(p, "@elsif", "op-elsif", true);
}

export function parseElse(p: ParserStream): ASTNodeElse {
    return parseIfBlocks<ASTNodeElse>(p, "@else", "op-else", false);
}

function parseIfBlocks<T extends ASTNode>(p: ParserStream, kw: string, type: string, hasExpr: boolean): T {
    p.expect(kw);
    p.skipSpaces();

    const node = {
        type,
        children: [],
        localData: [],
    };

    if (hasExpr) {
        const expr = p.consumeTill("{", false);
        p.skipSpaces();
        (node as ASTNodeIf).condition = expr;
    }

    parseBlockBody(p, node as T);

    return node as T;
}
