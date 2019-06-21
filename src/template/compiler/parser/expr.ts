import { ParserStream } from "../parse-stream";

export function parseExpr(p: ParserStream): { name: string, expr: string } {
    p.expect("@expr");
    p.skipSpaces();
    const expr = p.consumeTill("\n").trim();
    return { name: "@expr", expr };
}
