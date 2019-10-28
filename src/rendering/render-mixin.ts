import { ElementDef, OptDict } from "./render-tree";

export class RenderMixin {
    public _c(tag: string, opt: OptDict, rawChildren: any[]): ElementDef {
        const children = rawChildren.flat(8).filter(x => x);
        return { tag, opt, children };
    }

    public _l(data: any, iter: (data: any, index: any) => ElementDef): ElementDef[] {
        if (typeof data === "number") {
            return Array(data).fill(null).map((_, i) => iter(i, i));
        } else if (data instanceof Array) {
            return data.map(iter);
        } else if (typeof data === "object") {
            return Object.keys(data).map(k => iter(data[k], k));
        }
        throw Error(`The data to be iterate through should be an array or object, not ${data}`);
    }
}
