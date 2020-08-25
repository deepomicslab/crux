import { ASTNodeElse, ASTNodeElsif, ASTNodeIf } from "../ast-node";
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

function parseIfBlocks<T extends ASTNodeIf | ASTNodeElse | ASTNodeElsif>(
    p: ParserStream,
    kw: string,
    type: "op-if" | "op-else" | "op-elsif",
    hasExpr: boolean,
): T {
    p.expect(kw);
    p.skipSpaces();

    const node = ({
        type,
        children: [],
        localData: [],
    } as unknown) as ASTNodeIf;

    if (hasExpr) {
        const expr = p.consumeTill("{", false);
        p.skipSpaces();
        node.condition = expr.trim();
    }

    parseBlockBody(p, node as T);

    return node as T;
}
