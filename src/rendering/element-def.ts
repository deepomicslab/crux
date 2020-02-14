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

const renderCache: Map<string, any>[] = [];

export class LazyElementDef {
    public [kLazyElement] = true;

    constructor(
        public v: any,
        public tag: string,
        public id: string,
        public uniqID: string,
        public staticVal: boolean | (() => boolean),
        public block: () => [OptDict, ElementDef[]],
    ) { }

    public unfold(thisRef: any): NormalElementDef {
        const { tag, id, uniqID } = this;

        let cache!: Map<string, any>;
        const k = `${uniqID}@@${tag}`;
        const hasStatic = this.staticVal !== null && this.staticVal !== undefined;
        const isStatic = typeof this.staticVal === "function" ? this.staticVal() : this.staticVal;

        if (hasStatic) {
            cache = renderCache[this.v.uid];
            if (!cache) {
                cache = renderCache[this.v.uid] = new Map();
            }
            if (isStatic && !this.v.forceRedraw) {
                const data = cache.get(k);
                if (data) return data;
            }
        }

        const [opt, rawChildren] = this.block.call(thisRef);
        // FIXME: stop using flat()
        const children = rawChildren.flat(8).filter(x => x);
        const data = { tag, id, opt, children };
        if (hasStatic) {
            cache.set(k, data);
        }
        return data;
    }
}
