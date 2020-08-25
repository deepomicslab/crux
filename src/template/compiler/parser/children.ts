import { ASTNodeChildren } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { NAME } from "../tokens";
import { parseBlockBody } from "./block-body";

export function parseChildren(p: ParserStream): ASTNodeChildren {
    p.expect(":");
    const name = p.expect(NAME)[0];
    p.skipSpaces();
    let dataName: string | string[] | null = null;
    if (p.peek() === "(") {
        p.expect("\\(");
        p.skipSpaces();
        if (p.peek() === "{") {
            p.expect("{");
            dataName = p
                .consumeTill("}")
                .trim()
                .split(",")
                .map(s => s.trim());
            if (dataName.some(n => !n.match(new RegExp(`^${NAME}$`)))) {
                p._error(`names for the attached data is invalid: "${dataName}"`);
            }
        } else {
            dataName = p.expect(NAME, "attached data")[0];
        }
        p.skipSpaces();
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
