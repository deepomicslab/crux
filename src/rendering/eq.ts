// @ts-ignore
import shallowEqArrays from "shallow-equal/arrays";
// @ts-ignore
import shallowEqObjects from "shallow-equal/objects";

export function eq(oa: any, ob: any): boolean {
    const ka = Object.keys(oa);
    const kb = Object.keys(ob);
    if (!shallowEqArrays(ka, kb)) return false;
    for (const k of ka) {
        const a = oa[k]; const b = ob[k];
        const ta = typeof a;
        const tb = typeof b;
        if (ta !== tb) return false;
        if (a instanceof Array && !shallowEqArrays(a, b)) return false;
        if (ta === "object" && !shallowEqObjects(a, b)) return false;
        if (a !== b) return false;
    }
    return true;
}
