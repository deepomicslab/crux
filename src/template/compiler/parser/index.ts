import { TemplateMetaData } from "..";
import { ASTNode, ASTNodeComp } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { parseBlock } from "./block";
import { ExtCommand, parseExtCommand } from "./sfv";

export function parse(template: string, extended = false): [ASTNode, TemplateMetaData | null, ExtCommand[]] {
    const parser = new ParserStream(template.trim());
    const commands: ExtCommand[] = [];

    if (extended) {
        let c: ExtCommand | null;
        while ((c = parseExtCommand(parser))) {
            commands.push(c);
        }
    }

    const rootBlock = parser.expect("svg|canvas|component", "svg/canvas/component block", true);
    const isRoot = !!rootBlock;
    const ast = parseBlock(parser) as ASTNodeComp;
    parser.expectEnd();

    if (isRoot) {
        if (ast.children.length === 0) {
            throw Error(`The template cannot be empty`);
        } else if (ast.children.length > 1) {
            throw Error(`The template can only contain one root element`);
        }

        const metadata = ast.props.reduce((acc, curr) => {
            acc[curr.name] = curr.expr;
            return acc;
        }, {}) as TemplateMetaData;

        if (isRoot) metadata.renderer = rootBlock[0];
        metadata.rootComponent = (ast.children[0] as ASTNodeComp).name;
        ast.props = [];
        return [ast, metadata, commands];
    }

    return [ast, null, commands];
}
