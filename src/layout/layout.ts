import { Anchor, GeometryValue, isFixed } from "../defs/geometry";
import { BaseElement } from "../element/base-element";
import { BaseOption } from "../element/base-options";
import { Component } from "../element/component";
import { posWithAnchor } from "./anchor";

function updateGeometryProps(el: BaseElement, propName: string, parentSize: number) {
    let val = el.prop[propName];
    if (typeof val === "function" && "__internal__" in val) {
        val = val.call(el);
    }

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

export function layoutElement(el: BaseElement, skipFixed = false) {
    const isRoot = el instanceof Component && el.isRoot;
    const parent = el.logicalParent && el.logicalParent.parent ?
        el.logicalParent.parent : el.parent;
    const pWidth = isRoot ? el.$v.size.width : parent.$geometry.width;
    const pHeight = isRoot ? el.$v.size.height : parent.$geometry.height;
    let [hProps, vProps] = (el.constructor as typeof BaseElement).$geometryProps;
    if (skipFixed) {
        hProps = hProps.filter(p => !isFixed(el.prop[p]));
        vProps = vProps.filter(p => !isFixed(el.prop[p]));
    }

    for (const prop of hProps) {
        updateGeometryProps(el, prop, pWidth);
    }
    for (const prop of vProps) {
        updateGeometryProps(el, prop, pHeight);
    }
}

export function adjustByAnchor(el: BaseElement<BaseOption>) {
    if (el.adjustByAnchor) {
        el.adjustByAnchor.call(el);
        return;
    }
    let anchor: Anchor;
    if (anchor = el.prop.anchor) {
        const g = el.$geometry;
        g.x = posWithAnchor(true, g.x, el.maxX - g.x, anchor);
        g.y = posWithAnchor(false, g.y, el.maxY - g.y, anchor);
    }
}
