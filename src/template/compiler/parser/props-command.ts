import { ParserStream } from "../parse-stream";
import { consumeExpr } from "./prop";

export function parsePropsCommand(p: ParserStream): { name: string, expr: string } {
    p.expect("@props");
    p.skipSpaces();
    const expr = consumeExpr(p);
    p.skipSpaces(true);
    return {
        name: "__dynamic__", expr,
    };
}
