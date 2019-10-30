export interface OptDict {
    props: Record<string, any>;
    on: Record<string, any>;
    id: number;
    styles: Record<string, string>;
    behaviors: Record<string, Record<string, any>>;
    stages: Record<string, Record<string, any>>;
    namedChildren: Record<string, () => any>;
}

export interface NormalElementDef {
    tag: string;
    id: string;
    opt: OptDict;
    children: ElementDef[];
}

export type ElementDef = NormalElementDef | LazyElementDef;

export const kLazyElement = Symbol("LazyElement");

export class LazyElementDef {
    public [kLazyElement] = true;

    constructor(public tag: string, public id: string, public block: () => [OptDict, ElementDef[]]) {}

    public unfold(thisRef: any): NormalElementDef {
        const { tag, id } = this;
        const [opt, rawChildren] = this.block.call(thisRef);
        // FIXME: stop using flat()
        const children = rawChildren.flat(8).filter(x => x);
        return {
            tag, id, opt, children,
        };
    }
}
