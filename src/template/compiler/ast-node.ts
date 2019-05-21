export interface ASTNode {
    type: "comp" | "cond" | "op-if" | "op-for" | "op-elsif" | "op-else" | "children";
    localData: { name: string, expr: string }[];
    children: ASTNode[];
}

export interface ASTNodeFor extends ASTNode {
    type: "op-for";
    forName: string;
    forIndex?: string;
    expr: string;
}

export interface ASTNodeComp extends ASTNode {
    type: "comp";
    name: string;
    props: { name: string, expr: string }[];
    styles: { name: string, expr: string }[];
    on: { name: string, handler: string }[];
    behavior: { name: string, args: Record<string, any> }[];
}

export interface ASTNodeIf extends ASTNode {
    type: "op-if";
    condition: string;
}

export interface ASTNodeElsif extends ASTNode {
    type: "op-elsif";
    condition: string;
}

export interface ASTNodeElse extends ASTNode {
    type: "op-else";
}

export interface ASTNodeCondition extends ASTNode {
    type: "cond";
    children: (ASTNodeIf | ASTNodeElsif | ASTNodeElse)[];
}

export function newNode<T extends ASTNode>(type: string): T {
    return {
        type,
        localData: [],
        children: [],
    } as T;
}

export function isCompNode(node: ASTNode): node is ASTNodeComp {
    return node.type === "comp";
}

export function isRootElement(node: ASTNode): boolean {
    const name = (node as ASTNodeComp).name;
    return name === "svg" || name === "canvas" || name === "component";
}
