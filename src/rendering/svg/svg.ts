import { h, init } from "../vdom";
import moduleAttrs from "../vdom/modules/attributes";
import moduleEventLIsteners from "../vdom/modules/eventlisteners";
import moduleProps from "../vdom/modules/props";
import moduleStyle from "../vdom/modules/style";
import { VNode, VNodeData } from "../vdom/vnode";

import { oneLineTrim } from "common-tags";
import { BaseElement } from "../../element/base-element";
import { Component } from "../../element/component";
import { isRenderable } from "../../element/is";
import { BaseElementOption } from "../../element/primitive/base-elm-options";
import IS_NODE from "../../utils/is-node";
import { GradientDef, Visualizer } from "../../visualizer/visualizer";
import ns from "../ns";
import { Renderer } from "../renderer";
import { gatherEventListeners } from "../utils";

interface SVGContext {
    svgDef: Record<string, string>;
    svg?: SVGElement;
    appendDef: any;
}

const patch = init([moduleAttrs, moduleProps, moduleEventLIsteners, moduleStyle]);

export interface SVGRenderable {
    svgTagName(): string;
    svgAttrs(): Record<string, string | number | boolean>;
    svgTextContent(): string | null;
    vnode?: VNode;
}

const HOOKS_MAP = {
    // didMount: "insert",
    didPatch: "postpatch",
};

function updateParentVNode(elm: BaseElement) {
    let actualParent = elm.parent;
    if (!actualParent) return;
    let logicalSelf = elm;
    while ((isRenderable(actualParent) as boolean) && !actualParent.isRoot) {
        logicalSelf = actualParent;
        actualParent = logicalSelf.parent;
    }
    if (actualParent.isRoot) {
        actualParent.vnode = elm.vnode;
    } else {
        const i = actualParent.children.indexOf(logicalSelf);
        if (actualParent.vnode && actualParent.vnode.children) actualParent.vnode.children[i] = elm.vnode!;
        updateParentVNode(actualParent);
    }
}

function insertHook(elm: BaseElement<BaseElementOption>) {
    if (elm.__insertHook) return elm.__insertHook;
    const hook = (elm.__insertHook = (vnode: VNode) => {
        if (!elm.isRoot) elm.vnode = vnode;
        elm.$callHook("didMount");
    });
    return hook;
}

function updateHook(elm: BaseElement<BaseElementOption>) {
    if (elm.__updateHook) return elm.__updateHook;
    const hook = (elm.__updateHook = (_: VNode, vnode: VNode) => {
        if (!elm.isRoot) elm.vnode = vnode;
    });
    return hook;
}

function render(element: BaseElement<any>, context: SVGContext) {
    const vnode = _genView(element);
    _patch(element, vnode, context);
    updateSVGDef(context);
}

function _genView(element: BaseElement<any>): VNode {
    // if (element instanceof Component && element.isStatic && element.vnode) {
    if (element.parent && element.parent.isStatic && !element.parent._isRenderRoot && element.vnode) {
        return element.vnode;
    }
    if (isRenderable(element)) {
        return _genView(element.children[0]);
    }
    const attrs = element.svgAttrs();
    const tag = element.svgTagName();
    const text = element.svgTextContent();

    let children: VNode[] | undefined;
    if (element instanceof Component) {
        children = element.children.filter(c => c._isActive).map(_genView);
    }
    const key = element.prop.key || element.id;
    const opt: VNodeData = {
        attrs,
        key,
        ns,
        hook: {
            insert: insertHook(element),
            update: updateHook(element),
        },
        _elm: element,
    };

    // innerHTML
    if (attrs.innerHTML) {
        opt.props = { innerHTML: attrs.innerHTML };
    }

    // events
    const listeners = gatherEventListeners(element);
    if (listeners) {
        opt.on = listeners as any;
    }

    // styles
    let keys: string[];
    keys = Object.keys(element.$styles);
    if (keys.length > 0) {
        opt.style = element.$styles;
    }

    // cursor and visibility
    let v: any;
    v = element.prop.cursor;
    if (typeof v !== "undefined") {
        if (!opt.style) opt.style = {};
        opt.style["cursor"] = v;
    }
    v = element.prop.visible;
    if (typeof v !== "undefined") {
        if (!opt.style) opt.style = {};
        opt.style["visibility"] = v ? "visible" : "hidden";
    }

    // hooks
    Object.keys(HOOKS_MAP).forEach(k => {
        if (k in element) {
            opt.hook![HOOKS_MAP[k]] = element[k].bind(element);
        }
    });
    return h(tag, opt, children || text);
}

function _patch(element: BaseElement<any>, vnode: VNode, context: SVGContext) {
    if (element.isRoot) {
        element.vnode = patch(element.vnode ? element.vnode : _createRootElm(element, context), vnode);
    } else {
        let el = element;
        while (isRenderable(el)) {
            el = el.children[0];
        }
        if (el.vnode) {
            el.vnode = patch(el.vnode, vnode);
            updateParentVNode(el);
        }
    }
}

function _createRootElm(element: BaseElement, context: SVGContext): Element {
    const rootElm = document.createElementNS(ns, "g");
    const defElm = document.createElementNS(ns, "defs");
    defElm.innerHTML = Object.values(context.svgDef).join("");
    const svg = (context.svg = document.createElementNS(ns, "svg"));
    svg.setAttribute("xmlns", ns);
    setSize(element.$v, context);
    svg.setAttribute("style", "font-family: Arial");
    svg.appendChild(rootElm);
    svg.appendChild(defElm);
    element.$v.container!.appendChild(svg);
    return rootElm;
}

function updateSVGDef(context: SVGContext) {
    const defElm = context.svg!.getElementsByTagName("defs")[0];
    const html = Object.values(context.svgDef).join("");
    if (html === defElm.innerHTML) return;
    defElm.innerHTML = html;
}

function setSize(v: Visualizer, context: SVGContext) {
    if (!context.svg) return;
    context.svg.setAttribute("width", v.size.width);
    context.svg.setAttribute("height", v.size.height);
}

function appendDef(
    context: SVGContext,
    id: string,
    tag: string,
    attrs: Record<string, string> = {},
    content: string = "",
) {
    const attrStr = Object.keys(attrs)
        .map(k => `${k}=${attrs[k]}`)
        .join(" ");
    context.svgDef[id] = `<${tag} id="${id}" ${attrStr}>${content}</${tag}>`;
}

export function defineGradient(id: string, def: GradientDef, v: Visualizer, context: SVGContext) {
    appendDef(
        context,
        id,
        "linearGradient",
        {
            x1: `${def.x1}%`,
            x2: `${def.x2}%`,
            y1: `${def.y1}%`,
            y2: `${def.y2}%`,
        },
        def.stops
            .map(
                s => oneLineTrim`
                <stop offset="${s.offset}%" style="
                    stop-color:${s.color};
                    stop-opacity:${s.opacity === undefined ? 1 : s.opacity}" />
                `,
            )
            .join(),
    );
}

export function getGradient(name: string) {
    return `url(#${name})`;
}

const renderer: Renderer<SVGContext> = {
    init(v: Visualizer, context: SVGContext) {
        if (IS_NODE) {
            throw Error(`The "svg" renderer only works in browser environments.`);
        }
        context.svgDef = {};
        context.appendDef = (id: string, tag: string, attrs: Record<string, string> = {}, content: string = "") =>
            appendDef(context, id, tag, attrs, content);
    },
    setSize,
    render,
    defineGradient,
    getGradient,
};

export default renderer;
