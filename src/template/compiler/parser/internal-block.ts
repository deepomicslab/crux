import { ASTNodeComp } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { BEHAVIOR_BLOCK_NAME } from "../tokens";
import { parseProp } from "./prop";

export function parseBehaviorBlock(p: ParserStream): { name: string, args: Record<string, any>} {
    const [_, name] = p.expect(BEHAVIOR_BLOCK_NAME);

    const node: ASTNodeComp = {
        type: "comp",
        name,
        localData: [],
        children: [],
        props: [],
        on: [],
        styles: [],
        behavior: [],
    };

    p.skipSpaces(true);
    p.expect("{");

    while (true) {
        p.skipSpaces(true);
        parseProp(p, node);
        p.skipSpaces(true);
        if (p.peek() === "}") break;
    }

    p.expect("}");
    p.skipSpaces();

    return { name, args: node.props };
}
