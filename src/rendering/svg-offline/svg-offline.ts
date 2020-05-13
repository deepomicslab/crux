import { BaseElement } from "../../element/base-element";
import { Component } from "../../element/component";
import { isRenderable } from "../../element/is";
import { Visualizer } from "../../visualizer/visualizer";
import ns from "../ns";
import { Renderer } from "../renderer";
import { defineGradient, getGradient } from "../svg/svg";

interface SVGNode {
    tag: string;
    attrs: Record<string, string | number | boolean>;
    text: string | null;
    children?: SVGNode[];
    style: Record<string, string>;
}

interface SVGOfflineContext {
    svgObject: SVGNode;
    svgSize: { width: number; height: number };
    svgText: string;
}

function init(v: Visualizer, context: SVGOfflineContext) {
    setSize(v, context);
}

function _genNode(element: BaseElement<any>): SVGNode {
    if (isRenderable(element)) {
        return _genNode(element.children[0]);
    }

    const attrs = element.svgAttrs();
    const tag = element.svgTagName();
    const text = element.svgTextContent();
    const node: SVGNode = {
        tag,
        text,
        attrs,
        style: {},
    };

    if (element instanceof Component) {
        node.children = element.children.filter(c => c._isActive).map(_genNode);
    }

    let keys: string[];
    keys = Object.keys(element.$styles);
    if (keys.length > 0) {
        node.style = element.$styles;
    }

    const v = element.prop.visible;
    if (typeof v !== "undefined") {
        node.style["visibility"] = v ? "visible" : "hidden";
    }

    return node;
}

function _toString(node: SVGNode): string {
    let str = `<${node.tag}`;
    if (Object.keys(node.style).length) {
        str += ` style="${Object.entries(node.style)
            .map(([k, v]) => `${k}:${v};`)
            .join("")}"`;
    }
    if (Object.keys(node.attrs).length) {
        for (const [key, val] of Object.entries(node.attrs)) {
            str += ` ${key}="${val}"`;
        }
    }
    str += `>`;
    if (node.text) {
        str += node.text;
    } else if (node.children) {
        str += node.children.map(_toString).join("");
    }
    str += `</${node.tag}>`;
    return str;
}

function render(element: BaseElement<any>, context: SVGOfflineContext) {
    context.svgText = `
    <svg xmlns="${ns}" width="${context.svgSize.width}" height="${context.svgSize.height}" style="font-family: Arial">
    ${_toString(_genNode(element))}
    </svg>`;
}

function setSize(v: Visualizer, context: SVGOfflineContext) {
    context.svgSize = { width: v.size.width, height: v.size.height };
}

const renderer: Renderer = {
    init,
    render,
    setSize,
    defineGradient,
    getGradient,
};
export default renderer;
