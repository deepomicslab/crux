import { GeometryValue, Anchor } from "../defs/geometry";
import { BaseElement } from "../element/base-element";
import { Component } from "../element/component";
import { posWithAnchor } from "./anchor";
import { ComponentOption } from "../element/component-options";

function updateGeometryProps(el: BaseElement, propName: string, parentSize: number) {
    const val = el.prop[propName];
    if (typeof val === "undefined") {
        el.$geometry[propName] = 0;
    } else if (typeof val === "number") {
        el.$geometry[propName] = val;
    } else if ("value" in val) {
        el.$geometry[propName] = GeometryValue.cal(val, parentSize);
    } else {
        throw new Error(`Unexpected geometry value: ${val}`);
    }
}

export function layoutElement(el: BaseElement) {
    const isRoot = el instanceof Component && el.isRoot;
    const pWidth = isRoot ? el.$v.size.width : el.parent.$geometry.width;
    const pHeight = isRoot ? el.$v.size.height : el.parent.$geometry.height;
    const [hProps, vProps] = (el.constructor as typeof BaseElement).$geometryProps;

    for (const prop of hProps) {
        updateGeometryProps(el, prop, pWidth);
    }
    for (const prop of vProps) {
        updateGeometryProps(el, prop, pHeight);
    }

    if (el instanceof Component) {
        adjustByAnchor(el);
    }
}

export function adjustByAnchor(el: Component<ComponentOption>) {
    let anchor: Anchor;
    if (anchor = el.prop.anchor) {
        const g = el.$geometry;
        g.x = posWithAnchor(true, g.x, g.width, anchor);
        g.y = posWithAnchor(false, g.y, g.height, anchor);
    }
}