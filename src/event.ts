import { BaseElement } from "./element";
import { VNode } from "./rendering/vdom/vnode";

export const currentEventContext: {
    event: Event | undefined,
    vnode: VNode | undefined,
    elm: BaseElement | undefined,
} = {} as any;
