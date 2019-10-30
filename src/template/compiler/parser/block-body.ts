import { ASTNode, isCompNode } from "../ast-node";
import { ParserStream } from "../parse-stream";
import { BEHAVIOR_BLOCK_NAME, BLOCK_NAME, NAME, STAGE_BLOCK_NAME } from "../tokens";
import { parseBlock } from "./block";
import { parseChildren } from "./children";
import { parseExpr } from "./expr";
import { parseFor } from "./for";
import { parseElse, parseElsif, parseIf } from "./if";
import { parseBehaviorBlock, parseStageBlock } from "./internal-block";
import { parseLet } from "./let";
import { parseProp } from "./prop";
import { parsePropsCommand } from "./props-command";
import { parseYield } from "./yield";

function last<T>(array: T[]): T {
    return array[array.length - 1];
}

function checkElse(p: ParserStream, node: ASTNode, op: string) {
    const lastType = node.children.length && last(node.children).type;
    if (lastType !== "op-if" && lastType !== "op-elsif") {
        p._error(`@${op} should be preceded by @if or @elsif`);
    }
}

export function parseBlockBody(p: ParserStream, node: ASTNode) {
    p.expect("{");

    let stop = false;

    while (!stop) {
        p.skipSpaces(true);

        if (p.peek() === "}") stop = true;

        let noMatch = false;
        let testResult: RegExpMatchArray;
        if (testResult = p.test("@([a-z][a-z_\\-]*)")) {
            const op = testResult[1];
            switch (op) {
                case "if":
                    node.children.push(parseIf(p));
                    break;
                case "elsif":
                    checkElse(p, node, op);
                    node.children.push(parseElsif(p));
                    break;
                case "else":
                    checkElse(p, node, op);
                    node.children.push(parseElse(p));
                    break;
                case "for":
                    node.children.push(parseFor(p));
                    break;
                case "let":
                    node.localData.push(parseLet(p, node));
                    break;
                case "expr":
                    node.localData.push(parseExpr(p));
                    break;
                case "props":
                    if (isCompNode(node)) {
                        node.props.push(parsePropsCommand(p));
                    } else {
                        p._error(`@options can only appear in component blocks.`);
                    }
                    break;
                case "yield":
                    node.children.push(parseYield(p));
                    break;
                default:
                    throw new Error(`Unknown command: @${op}`);
            }
        } else if (p.peek() === ":") {
            const children = parseChildren(p);
            node.namedChildren[children.name] = children;
        } else if (testResult = p.test(BLOCK_NAME)) {
            node.children.push(parseBlock(p));
        } else if (testResult = p.test(STAGE_BLOCK_NAME)) {
            if (isCompNode(node)) {
                node.stage.push(parseStageBlock(p));
            } else {
                p._error(`Stage blocks can only appear in component blocks.`);
            }
        } else if (testResult = p.test(BEHAVIOR_BLOCK_NAME)) {
            if (isCompNode(node)) {
                node.behavior.push(parseBehaviorBlock(p));
            } else {
                p._error(`Behavior blocks can only appear in component blocks.`);
            }
        } else if (testResult = p.test(NAME)) {
            if (isCompNode(node)) {
                parseProp(p, node);
            } else {
                p._error(`Property definitions can only appear in component blocks.`);
            }
        } else {
            noMatch = true;
        }

        p.skipSpaces(true);

        if (p.peek() === "}") {
            stop = true;
        } else if (noMatch) {
            p._error(`Unexpected expression in block body.`);
        }
    }

    p.expect("}");
}
