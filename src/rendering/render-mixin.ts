import { ElementDef, LazyElementDef, OptDict } from "./element-def";

const indices = [0];

export default class RenderMixin {
    public _z(
        this: any,
        tag: string,
        id: string,
        staticVal: boolean | (() => boolean),
        block: () => [OptDict, any[]],
        _useAutoKey = false,
    ): ElementDef {
        const uniqID = `${id}-${indices[indices.length - 1]}`;
        if (_useAutoKey) id = uniqID;
        return new LazyElementDef(this.$v, tag, id, uniqID, staticVal, block);
    }

    public _c(this: any, tag: string, id: string, opt: OptDict, rawChildren: any[], _useAutoKey = false): ElementDef {
        if (_useAutoKey) id = `${id}-${indices[indices.length - 1]}`;
        const children = rawChildren.flat(8).filter(x => x);
        return { tag, id, opt, children };
    }

    public _l(this: any, data: any, iter: (data: any, index: any) => ElementDef[], _isOuterLoop = true): ElementDef[] {
        if (_isOuterLoop) indices.push(0);

        let result: ElementDef[][];

        if (typeof data === "number") {
            result = Array(data)
                .fill(null)
                .map((_, i) => {
                    indices[indices.length - 1]++;
                    return iter(i, i);
                });
        } else if (data instanceof Array) {
            result = data.map((d, i) => {
                indices[indices.length - 1]++;
                return iter(d, i);
            });
        } else if (typeof data === "object") {
            result = Object.entries(data).map(([k, v]) => {
                indices[indices.length - 1]++;
                return iter(v, k);
            });
        } else {
            throw Error(`The data to be iterated through should be an array or object, not ${data}`);
        }

        if (_isOuterLoop) indices.pop();
        return result.flat();
    }
}
