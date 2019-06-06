import { ASTNodeComp } from "../ast-node";
import { parseExpr } from "./prop";

const MODIFIERS = {
    "centered": { anchor: "@anchor(middle, center)" },
    "full": { width: "100%", height: "100%" },
};

export function parseModifiers(node: ASTNodeComp, str: string) {
    return str.split(".").filter(m => m).map(m => {
        const props = MODIFIERS[m];
        if (!props)
            throw new Error(`Unknown modifier: ${m}`);
        return Object.keys(props).map(k => parseExpr(node, k, props[k]));
    }).flat();
}