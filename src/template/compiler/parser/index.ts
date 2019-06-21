import { TemplateMetaData } from "..";
import { ASTNode, ASTNodeComp } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { parseBlock } from "./block";

export function parse(template: string): [ASTNode, TemplateMetaData | null] {
    const parser = new ParserStream(template.trim());

    const isRoot = !!parser.expect("svg|canvas|component", "svg/canvas/component block", true);
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

        metadata.rootComponent = (ast.children[0] as ASTNodeComp).name;
        ast.props = [];
        return [ast, metadata];
    }

    return [ast, null];
}
