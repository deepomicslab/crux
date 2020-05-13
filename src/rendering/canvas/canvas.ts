import { BaseElement, Component, ElementEventListener } from "../../element";
import { isRenderable } from "../../element/is";
import IS_NODE from "../../utils/is-node";
import { toRad } from "../../utils/math";
import { GradientDef, Visualizer } from "../../visualizer/visualizer";
import { Renderer } from "../renderer";
import { gatherEventListeners } from "../utils";

declare module "../../element/component" {
    interface Component<Option> {
        canvasCache?: HTMLCanvasElement;
    }
}

interface CanvasContext {
    ctx: CanvasRenderingContext2D;
    gradients: Record<string, CanvasGradient>;
}

export interface CanvasRenderable {
    renderToCanvas(ctx: CanvasRenderingContext2D): void;
}

function render(element: BaseElement<any>, context: CanvasContext) {
    const v = element.$v;
    if (!v) {
        throw new Error(`The element must be placed in a visualizer`);
    }
    if (!context.ctx) {
        init(v, context);
    }
    context.ctx.clearRect(0, 0, context.ctx.canvas.width, context.ctx.canvas.height);
    const ratio = window.devicePixelRatio || 1;
    context.ctx.save();
    context.ctx.scale(ratio, ratio);
    _render(context.ctx, v.root);
    context.ctx.restore();
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

    let useOffline = false;
    let offlineCanvas: HTMLCanvasElement | null = null;
    let currentCtx = ctx;
    let offset = [0, 0];
    if (element instanceof Component && element.isStatic) {
        if (element.prop.maxBoundOffset) {
            offset = element.prop.maxBoundOffset;
            if (!Array.isArray(offset)) {
                throw new Error(`maxBoundOffset must be an array of numbers`);
            }
        }
        if (!element.$v.forceRedraw && element.canvasCache) {
            ctx.drawImage(element.canvasCache, -offset[0], -offset[1]);
            ctx.restore();
            return;
        }
        useOffline = true;
        const oc = document.createElement("canvas");
        oc.width = element.$v.size.width + offset[0];
        oc.height = element.$v.size.height + offset[1];
        offlineCanvas = element.canvasCache = oc;
        currentCtx = offlineCanvas.getContext("2d")!;
        currentCtx.translate(offset[0], offset[1]);
    }

    const listeners = (element._gatheredListeners = gatherEventListeners(element));
    if (listeners) {
        Object.keys(listeners).forEach(ev => {
            element.$v._registeredEvents.add(MOUSE_EVENT_MAP[ev]);
        });
    }

    if (element instanceof Component) {
        element.children.filter(c => c._isActive).forEach(e => _render(currentCtx, e));
    }
    if (useOffline) {
        ctx.drawImage(offlineCanvas!, -offset[0], -offset[1]);
    }

    ctx.restore();
}

function init(v: Visualizer, context: CanvasContext) {
    if (IS_NODE) {
        throw Error(`The "svg" renderer only works in browser environments.`);
    }
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error(`Cannot get canvas context`);
    }

    // const ratio = window.devicePixelRatio || 1;
    context.ctx = ctx;
    context.gradients = {};
    setSize(v, context);
    ctx.font = "12px Arial";
    // ctx.scale(ratio, ratio);

    for (const event of Object.keys(MOUSE_EVENT_MAP) as (keyof typeof MOUSE_EVENT_MAP)[]) {
        addMouseEventListener(v, context, canvas, event);
    }

    v.container!.appendChild(canvas);
}

function setSize(v: Visualizer, context: CanvasContext) {
    if (!context.ctx) return;
    const canvas = context.ctx.canvas;
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = v.size;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
}

function defineGradient(id: string, def: GradientDef, v: Visualizer, context: CanvasContext) {
    const g = context.ctx.createLinearGradient(def.x1, def.y1, def.x2, def.y2);
    for (const stop of def.stops) {
        g.addColorStop(stop.offset * 0.01, stop.color);
    }
    context.gradients[id] = g;
}

function getGradient(name: string, v: Visualizer, context: CanvasContext) {
    return context.gradients[name];
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

function addMouseEventListener<T>(v: Visualizer, context: CanvasContext, canvas: HTMLCanvasElement, event: EventName) {
    const mappedEvent = MOUSE_EVENT_MAP[event];
    const isMouseMove = mappedEvent === "_mousemove";
    const isMouseLeave = event === "mouseleave";
    canvas.addEventListener(event, function (this: HTMLCanvasElement, e: MouseEvent) {
        if (!v._registeredEvents.has(mappedEvent)) return;
        const ratio = window.devicePixelRatio || 1;
        const b = canvas.getBoundingClientRect();
        const x = (e.clientX - b.left) * ratio;
        const y = (e.clientY - b.top) * ratio;
        context.ctx.save();
        context.ctx.scale(ratio, ratio);
        const element = isMouseLeave ? null : findElement(context.ctx, v.root, x, y);
        context.ctx.restore();
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
                context.ctx.canvas.style.cursor = "";
            }
        }
    });
}

function findElement(
    ctx: CanvasRenderingContext2D,
    el: BaseElement<any>,
    x: number,
    y: number,
): BaseElement<any> | null {
    if (!shouldAcceptEvents(el)) return null;
    if (el instanceof Component) {
        if (isRenderable(el as any)) {
            return findElement(ctx, el.children[0], x, y);
        } else {
            ctx.save();
            if (!el.$_cachedTransform) return null;
            const [tx, ty, rc] = el.$_cachedTransform;
            if (tx !== 0 || ty !== 0) {
                ctx.translate(tx, ty);
            }
            if (rc !== 0) {
                ctx.rotate(toRad(rc));
            }
            let r: BaseElement<any> | null;
            for (let i = el.children.length - 1; i >= 0; i--) {
                if ((r = findElement(ctx, el.children[i], x, y))) {
                    ctx.restore();
                    return r;
                }
            }
            ctx.restore();
        }
        return null;
    } else {
        if (el._isActive && el.path && ctx.isPointInPath(el.path, x, y)) {
            return el;
        }
        return null;
    }
}

function shouldAcceptEvents(el: BaseElement) {
    const events = el.prop.events;
    if (events === "all") return true;
    else if (events === "none") return false;
    return el.prop["fill"] !== "none";
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
        el.$v.rendererCtx.ctx.canvas.style.cursor = cursor ? cursor : "";
    }
}

export type CanvasMouseEvent = MouseEvent & {
    _m_x?: number;
    _m_y?: number;
};

function callListener(
    listener: ElementEventListener | ElementEventListener[],
    e: CanvasMouseEvent,
    el: BaseElement,
    x: number,
    y: number,
) {
    e._m_x = x;
    e._m_y = y;
    if (typeof listener === "function") {
        listener.call(null, e, el);
    } else if (listener[0] !== null) {
        listener[0].apply(null, listener.slice(1) as any);
    } else {
        for (let i = 1; i < listener.length; i++) callListener(listener[i], e, el, x, y);
    }
}

const renderer: Renderer = {
    init,
    render,
    setSize,
    defineGradient,
    getGradient,
};

export default renderer;
