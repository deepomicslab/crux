export interface ASTNode {
    type: "comp" | "cond" | "op-if" | "op-for" | "op-elsif" | "op-else" | "yield" | "children";
    localData: { name: string; expr: string }[];
    children: ASTNode[];
    namedChildren: Record<string, ASTNodeChildren>;
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
    key?: string;
    isLazy?: boolean;
    staticVal?: string;
    initArg?: string;
    props: { delegate?: string; name: string; expr: string }[];
    styles: { name: string; expr: string }[];
    on: { name: string; handler: string }[];
    behavior: { name: string; args: { name: string; expr: string }[] }[];
    stage: { name: string; args: { name: string; expr: string }[] }[];
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

export interface ASTNodeYield extends ASTNode {
    type: "yield";
    name: string;
    data: string;
    processor: string;
}

export interface ASTNodeChildren extends ASTNode {
    type: "children";
    name: string;
    dataName: string | string[] | null;
}

export function newNode<T extends ASTNode>(type: string): T {
    return ({
        type,
        localData: [],
        children: [],
        namedChildren: {},
    } as unknown) as T;
}

export function newCompNode(name: string): ASTNodeComp {
    return {
        type: "comp",
        name,
        localData: [],
        children: [],
        namedChildren: {},
        props: [],
        on: [],
        styles: [],
        behavior: [],
        stage: [],
    };
}

export function isCompNode(node: ASTNode): node is ASTNodeComp {
    return node.type === "comp";
}

export function isRootElement(node: ASTNode): boolean {
    const name = (node as ASTNodeComp).name;
    return name === "svg" || name === "canvas" || name === "component";
}
