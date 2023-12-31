import { VNode, VNodeData } from "../vnode";
import { Module } from "./module";

import { currentEventContext } from "../../../event";

export type On = {
    [N in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[N]) => void
} & {
    [event: string]: EventListener | EventListener[],
};

function invokeHandler(handler: any, vnode?: VNode, event?: Event): void {
    if (typeof handler === "function") {
        // call function handler
        currentEventContext.event = event;
        currentEventContext.elm = vnode!.data!._elm;
        currentEventContext.vnode = vnode;
        handler.call(null, event, vnode!.data!._elm, vnode);
        currentEventContext.event = undefined;
        currentEventContext.elm = undefined;
        currentEventContext.vnode = undefined;
    } else if (typeof handler === "object") {
        // call handler with arguments
        if (typeof handler[0] === "function") {
            // special case for single argument for performance
            currentEventContext.event = event;
            currentEventContext.elm = vnode!.data!._elm;
            currentEventContext.vnode = vnode;
            if (handler.length === 2) {
                handler[0].call(null, handler[1]);
            } else {
                const args = handler.slice(1);
                handler[0].apply(null, args);
            }
            currentEventContext.event = undefined;
            currentEventContext.elm = undefined;
            currentEventContext.vnode = undefined;
        } else {
            // call multiple handlers
            for (let i = 1; i < handler.length; i++) {
                invokeHandler(handler[i], vnode, event);
            }
        }
    }
}

function handleEvent(event: Event, vnode: VNode) {
    const name = event.type, on = (vnode.data as VNodeData).on;

    // call event handler(s) if exists
    if (on && on[name]) {
        invokeHandler(on[name], vnode, event);
    }
}

function createListener() {
    return function handler(event: Event) {
        handleEvent(event, (handler as any).vnode);
    };
}

function updateEventListeners(oldVnode: VNode, vnode?: VNode): void {
    const oldOn = (oldVnode.data as VNodeData).on,
        oldListener = (oldVnode as any).listener,
        oldElm: Element = oldVnode.elm as Element,
        on = vnode && (vnode.data as VNodeData).on,
        elm: Element = (vnode && vnode.elm) as Element;
    let name: string;

    // optimization for reused immutable handlers
    if (oldOn === on) {
        return;
    }

    // remove existing listeners which no longer used
    if (oldOn && oldListener) {
        // if element changed or deleted we remove all existing listeners unconditionally
        if (!on) {
            // tslint:disable-next-line: forin
            for (name in oldOn) {
                // remove listener if element was changed or existing listeners removed
                oldElm.removeEventListener(name, oldListener, false);
            }
        } else {
            for (name in oldOn) {
                // remove listener if existing listener removed
                if (!on[name]) {
                    oldElm.removeEventListener(name, oldListener, false);
                }
            }
        }
    }

    // add new listeners which has not already attached
    if (on) {
        // reuse existing listener or create new
        const listener = (vnode as any).listener = (oldVnode as any).listener || createListener();
        // update vnode for listener
        listener.vnode = vnode;

        // if element changed or added we add all needed listeners unconditionally
        if (!oldOn) {
            // tslint:disable-next-line: forin
            for (name in on) {
                // add listener if element was changed or new listeners added
                elm.addEventListener(name, listener, false);
            }
        } else {
            for (name in on) {
                // add listener if new listener added
                if (!oldOn[name]) {
                    elm.addEventListener(name, listener, false);
                }
            }
        }
    }
}

export const eventListenersModule = {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: updateEventListeners,
} as Module;
export default eventListenersModule;
