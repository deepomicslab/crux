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
import ns from "./ns";

const patch = init([
    moduleAttrs,
    moduleProps,
    moduleEventLIsteners,
    moduleStyle,
]);

export interface SVGRenderable {
    svgTagName(): string;
    svgAttrs(): Record<string, string | number | boolean>;
    svgTextContent(): string;
    vnode: VNode;
}

const HOOKS_MAP = {
    // didMount: "insert",
    didPatch: "postpatch",
};

function insertHook(elm: BaseElement<BaseElementOption>) {
    return (vnode: VNode) => {
        if (!elm.isRoot) elm.vnode = vnode;
        elm.$callHook("didMount");
    };
}

function render(element: BaseElement<any>) {
    const vnode = _genView(element);
    _patch(element, vnode);
}

function _genView(element: BaseElement<any>): VNode {
    if (isRenderable(element)) {
        return _genView(element.children[0]);
    }
    const attrs = element.svgAttrs();
    const tag = element.svgTagName();
    const text = element.svgTextContent();

    let children: VNode[];
    if (element instanceof Component) {
        children = element.children
            .filter(c => c.isActive)
            .map(c => _genView(c));
    }
    const key = element.prop.key || element.id;
    const opt: VNodeData = {
        attrs,
        key,
        ns,
        hook: {
            insert: insertHook(element),
        },
    };

    // innerHTML
    if (attrs.innerHTML) {
        opt.props = { innerHTML: attrs.innerHTML };
    }

    let keys: string[];
    // events
    keys = Object.keys(element.$on);
    if (keys.length > 0) {
        opt.on = element.$on;
    }

    // styles
    keys = Object.keys(element.$styles);
    if (keys.length > 0) {
        opt.style = element.$styles;
    }

    // hooks
    Object.keys(HOOKS_MAP).forEach((k) => {
        if (k in element) {
            opt.hook[HOOKS_MAP[k]] = element[k].bind(element);
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
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("xmlns", ns);
    svg.setAttribute("width", element.$v.size.width);
    svg.setAttribute("height", element.$v.size.height);
    svg.appendChild(rootElm);
    svg.appendChild(defElm);
    element.$v.container.appendChild(svg);
    return rootElm;
}

export { render };
