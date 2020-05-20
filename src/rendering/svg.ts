import { h, init } from "./vdom";
import moduleAttrs from "./vdom/modules/attributes";
import moduleEventLIsteners from "./vdom/modules/eventlisteners";
import moduleProps from "./vdom/modules/props";
import moduleStyle from "./vdom/modules/style";
import { VNode, VNodeData } from "./vdom/vnode";

import { BaseElement } from "../element/base-element";
import { Component } from "../element/component";
import { isRenderable } from "../element/is";
import { BaseElementOption } from "../element/primitive/base-elm-options";
import { Visualizer } from "../visualizer/visualizer";
import ns from "./ns";
import { gatherEventListeners } from "./utils";

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

export function render(element: BaseElement<any>) {
    const vnode = _genView(element);
    _patch(element, vnode);
    updateSVGDef(element.$v);
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

function _patch(element: BaseElement<any>, vnode: VNode) {
    if (element.isRoot) {
        element.vnode = patch(element.vnode ? element.vnode : _createRootElm(element), vnode);
    } else {
        let el = element;
        while (isRenderable(el)) {
            el = el.children[0];
        }
        if (el.vnode) {
            el.vnode = patch(el.vnode, vnode);
        }
    }
}

function _createRootElm(element: BaseElement): Element {
    const rootElm = document.createElementNS(ns, "g");
    const defElm = document.createElementNS(ns, "defs");
    defElm.innerHTML = Object.values(element.$v.svgDef).join("");
    const svg = (element.$v.svg = document.createElementNS(ns, "svg"));
    svg.setAttribute("xmlns", ns);
    setSize(element.$v);
    svg.setAttribute("style", "font-family: Arial");
    svg.appendChild(rootElm);
    svg.appendChild(defElm);
    element.$v.container.appendChild(svg);
    return rootElm;
}

function updateSVGDef(v: Visualizer) {
    const defElm = v.svg!.getElementsByTagName("defs")[0];
    const html = Object.values(v.svgDef).join("");
    if (html === defElm.innerHTML) return;
    defElm.innerHTML = html;
}

export function setSize(v: Visualizer) {
    if (!v.svg) return;
    v.svg.setAttribute("width", v.size.width);
    v.svg.setAttribute("height", v.size.height);
}
