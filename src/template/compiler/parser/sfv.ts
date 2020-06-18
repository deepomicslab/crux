import { ParserStream } from "../parse-stream";
import { NAME } from "../tokens";
import { consumeExpr } from "./prop";

export interface ExtCommand {
    type: "load";
    name: string;
    payload: any;
}

const EXT_COMMAND = "@(\\w[\\w_0-9]*\\b)";

export function parseExtCommand(p: ParserStream): ExtCommand | null {
    p.skipSpaces();
    const match = p.test(EXT_COMMAND);
    if (!match) return null;

    switch (match[1]) {
        case "load":
            p.expect("@load");
            p.skipSpaces();
            const name = p.expect(NAME)[0];
            p.skipSpaces();
            const remaining = consumeExpr(p);
            return {
                type: "load",
                name,
                payload: remaining,
            };
        default:
            return null;
    }
}
