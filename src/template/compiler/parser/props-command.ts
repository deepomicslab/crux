import { ParserStream } from "../parse-stream";
import { FOR_EXPR, NAME } from "../tokens";

export function parsePropsCommand(p: ParserStream): { name: string, expr: string } {
    p.expect("@props");
    p.skipSpaces();
    const expr = p.expect(FOR_EXPR)[0];
    p.skipSpaces(true);
    return {
        name: "__dynamic__", expr,
    };
}
