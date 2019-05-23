import { ParserStream } from "../parse-stream";
import { NAME } from "../tokens";

export function parseExpr(p: ParserStream): { name: string, expr: string } {
    p.expect("@expr");
    p.skipSpaces();
    const expr = p.consumeTill("\n").trim();
    return { name: "@expr", expr };
}
