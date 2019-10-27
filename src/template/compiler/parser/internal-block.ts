import { newCompNode } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { BEHAVIOR_BLOCK_NAME, STAGE_BLOCK_NAME } from "../tokens";
import { parseProp } from "./prop";

export function parseBehaviorBlock(p: ParserStream): { name: string, args: { name: string, expr: string }[]} {
    const [, name] = p.expect(BEHAVIOR_BLOCK_NAME);

    const node = newCompNode(name);

    p.skipSpaces(true);
    p.expect("{");

    while (true) {
        p.skipSpaces(true);
        if (p.peek() === "}") break;
        parseProp(p, node);
    }

    p.expect("}");
    p.skipSpaces();

    return { name, args: node.props };
}

export function parseStageBlock(p: ParserStream): { name: string, args: { name: string, expr: string }[]} {
    const [, name] = p.expect(STAGE_BLOCK_NAME);

    const node = newCompNode(name);

    p.skipSpaces(true);
    p.expect("{");

    while (true) {
        p.skipSpaces(true);
        if (p.peek() === "}") break;
        parseProp(p, node);
    }

    p.expect("}");
    p.skipSpaces();

    return { name, args: node.props };
}
