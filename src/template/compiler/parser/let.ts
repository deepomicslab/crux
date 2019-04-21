import { ParserStream } from "../parse-stream";
import { NAME } from "../tokens";

export function parseLet(p: ParserStream): { name: string, expr: string } {
    p.expect("@let");
    p.skipSpaces();
    const name = p.expect(NAME)[0];
    p.skipSpaces();
    p.expect("=");
    p.skipSpaces();
    const expr = p.consumeTill("\n").trim();
    return { name, expr };
}
