import { BaseElement } from "../element/base-element";
import { BaseOption } from "../element/base-options";
import { isRenderable } from "../element/is";

export function gatherEventListeners(el: BaseElement<BaseOption>) {
    const listeners: Record<string, ((e: Event) => void)[] | ((e: Event) => void)> = {};
    let p = el;
    let empty = true;
    function gather(k: string, l: any) {
        if (typeof listeners[k] === "undefined") {
            listeners[k] = l;
        } else if (typeof listeners[k] === "function") {
            listeners[k] = [null, listeners[k] as any, l];
        } else {
            (listeners[k] as any[]).push(l);
        }
        empty = false;
    }
    do {
        Object.keys(p.$on).forEach(k => gather(k, p.$on[k]));
        Object.values(p.$behavior).forEach(b => b.events.forEach(k => gather(k, b[k].bind(b))));
        p = p.parent;
    } while (p && isRenderable(p));
    return empty ? null : listeners;
}
