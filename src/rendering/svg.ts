import { h, init } from "./vdom";
import moduleAttrs from "./vdom/modules/attributes";
import moduleEventLIsteners from "./vdom/modules/eventlisteners";
import { VNode } from "./vdom/vnode";

import { BaseElement } from "../element/base-element";
import { Component } from "../element/component";
import { isRenderable } from "../element/components/is-renderable";
import ns from "./ns";

const patch = init([
    moduleAttrs,
    moduleEventLIsteners,
]);

export interface SVGRenderable {
    svgTagName(): string;
    svgAttrs(): Record<string, string | number | boolean>;
    svgTextContent(): string;
    vnode: VNode;
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
        children = element.children.map(c => _genView(c));
    }
    const key = element.prop.key || element.uid;
    return h(tag, {
        attrs,
        key,
        ns,
    }, children || text);
}

function _patch(element: BaseElement<any>, vnode: VNode) {
    if (element.vnode) {
        element.vnode = patch(element.vnode, vnode);
    } else {
        element.vnode = patch(_createRootElm(element), vnode);
    }
}

function _createRootElm(element: BaseElement): Element {
    const rootElm = document.createElementNS(ns, "g");
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("xmlns", ns);
    svg.setAttribute("width", element.$v.size.width);
    svg.setAttribute("height", element.$v.size.height);
    svg.appendChild(rootElm);
    element.$v.container.appendChild(svg);
    return rootElm;
}

export { render };
