import { BaseElement, Component, ElementEventListener } from "../element";
import { isRenderable } from "../element/is";
import { toRad } from "../utils/math";
import { Visualizer } from "../visualizer/visualizer";
import { gatherEventListeners } from "./utils";

export interface CanvasRenderable {
    renderToCanvas(ctx: CanvasRenderingContext2D): void;
}

export function render(element: BaseElement<any>) {
    const v = element.$v;
    if (!v) {
        throw new Error(`The element must be placed in a visualizer`);
    }
    if (!v.ctx) {
        init(v);
    }
    v.ctx!.clearRect(0, 0, v.ctx!.canvas.width, v.ctx!.canvas.height);
    _render(v.ctx!, v.root);
}

function _render(ctx: CanvasRenderingContext2D, element: BaseElement<any>): void {
    if (element.prop.visible === false) {
        return;
    }
    if (isRenderable(element)) {
        return _render(ctx, element.children[0]);
    }
    ctx.save();
    element.renderToCanvas(ctx);

    const listeners = element._gatheredListeners = gatherEventListeners(element);
    if (listeners) {
        Object.keys(listeners).forEach(ev => {
            element.$v._registeredEvents.add(MOUSE_EVENT_MAP[ev]);
        });
    }

    if (element instanceof Component) {
        element.children.filter(c => c.isActive).forEach(e => _render(ctx, e));
    }
    ctx.restore();
}

export function init(v: Visualizer) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error(`Cannot get canvas context`);
    }

    const ratio = window.devicePixelRatio || 1;
    const { width, height } = v.size;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.font = "12px Arial";
    ctx.scale(ratio, ratio);

    for (const event of Object.keys(MOUSE_EVENT_MAP) as (keyof typeof MOUSE_EVENT_MAP)[]) {
        addMouseEventListener(v, canvas, event);
    }

    v.container.appendChild(canvas);
    v.ctx = ctx;
}

const MOUSE_EVENT_MAP = {
    mouseenter: "_mousemove",
    mouseleave: "_mousemove",
    mousemove: "_mousemove",
    mouseup: "mouseup",
    mousedown: "mousedown",
    click: "click",
    wheel: "wheel",
} as const;

type EventName = keyof typeof MOUSE_EVENT_MAP;

function addMouseEventListener<T>(v: Visualizer, canvas: HTMLCanvasElement, event: EventName) {
    const mappedEvent = MOUSE_EVENT_MAP[event];
    const isMouseMove = mappedEvent === "_mousemove";
    const isMouseLeave = event === "mouseleave";
    canvas.addEventListener(event, function(this: HTMLCanvasElement, e: MouseEvent) {
        if (!v._registeredEvents.has(mappedEvent)) return;
        const b = canvas.getBoundingClientRect();
        const x = (e.pageX - b.left) * window.devicePixelRatio;
        const y = (e.pageY - b.top) * window.devicePixelRatio;
        const element = isMouseLeave ? null : findElement(v.ctx!, v.root, x, y);
        if (isMouseMove) {
            for (const el of v._focusedElements.values()) {
                el._isFocused = false;
            }
        }
        if (element) {
            bubbleEvent(mappedEvent, element);
        }
        // handle unfocused elements
        if (isMouseMove) {
            const blurredElements = [];
            for (const el of v._focusedElements.values()) {
                if (!el._isFocused) {
                    blurredElements.push(el);
                }
            }
            for (const el of blurredElements) {
                if (el._gatheredListeners && "mouseleave" in el._gatheredListeners) {
                    callListener(el._gatheredListeners.mouseleave, e, el, x, y);
                }
                v._focusedElements.delete(el);
            }
        }
        if (element) {
            triggerEvents(mappedEvent, e, element, x, y);
        } else {
            if (v._currentCursor) {
                v._currentCursor = null;
                v.ctx!.canvas.style.cursor = "";
            }
        }
    });
}

function findElement(ctx: CanvasRenderingContext2D, el: BaseElement<any>, x: number, y: number): BaseElement<any> | null {
    if (el instanceof Component) {
        if (isRenderable(el as any)) {
            return findElement(ctx, el.children[0], x, y);
        } else {
            ctx.save();
            const [tx, ty, rc] = el._cachedTransform!;
            if (tx !== 0 || ty !== 0) {
                ctx.translate(tx, ty);
            }
            if (rc !== 0) {
                ctx.rotate(toRad(rc));
            }
            let r: BaseElement<any> | null;
            for (let i = el.children.length - 1; i >= 0; i--) {
                if (r = findElement(ctx, el.children[i], x, y)) {
                    ctx.restore();
                    return r;
                }
            }
            ctx.restore();
        }
        return null;
    } else {
        if (el.path && ctx.isPointInPath(el.path, x, y)) {
            return el;
        }
        return null;
    }
}

function bubbleEvent(event: string, el: BaseElement<any>) {
    let p = el;
    const isMouseMove = event === "_mousemove";
    while (p) {
        if (isMouseMove) {
            p._isFocused = true;
        }
        p = p.parent;
    }
}

function triggerEvents(event: string, origEvent: MouseEvent, el: BaseElement<any>, x: number, y: number) {
    let p = el;
    const isMouseMove = event === "_mousemove";
    let cursor: string | null = null;
    let cursorIsSet = false;
    while (p) {
        if (!cursorIsSet && (cursor = p.prop.cursor)) {
            cursorIsSet = true;
        }
        if (p._gatheredListeners) {
            if (isMouseMove) {
                if (el.$v._focusedElements.has(p)) {
                    if ("mousemove" in p._gatheredListeners) {
                        callListener(p._gatheredListeners.mousemove, origEvent, p, x, y);
                    }
                } else {
                    if ("mouseenter" in p._gatheredListeners) {
                        callListener(p._gatheredListeners.mouseenter, origEvent, p, x, y);
                    }
                }
            } else {
                if (event in p._gatheredListeners) {
                    callListener(p._gatheredListeners[event], origEvent, p, x, y);
                    return;
                }
            }
        }
        if (isMouseMove) {
            el.$v._focusedElements.add(p);
        }
        p = p.parent;
    }
    if (cursor !== el.$v._currentCursor) {
        el.$v._currentCursor = cursor;
        el.$v.ctx!.canvas.style.cursor = cursor ? cursor : "";
    }
}

export type CanvasMouseEvent = MouseEvent & {
    _m_x?: number;
    _m_y?: number;
};

function callListener(
    listener: ElementEventListener|ElementEventListener[],
    e: CanvasMouseEvent, el: BaseElement, x: number, y: number) {
    e._m_x = x;
    e._m_y = y;
    if (typeof listener === "function") {
        listener.call(null, e, el);
    } else {
        for (let i = 1; i < listener.length; i++)
            listener[i].call(null, e, el);
    }
}
