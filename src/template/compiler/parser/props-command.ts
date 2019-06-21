import { ParserStream } from "../parse-stream";

export function parsePropsCommand(p: ParserStream): { name: string, expr: string } {
    p.expect("@props");
    p.skipSpaces();
    const expr = p.consumeTill("\n");
    p.skipSpaces(true);
    return {
        name: "__dynamic__", expr,
    };
}
