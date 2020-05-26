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

    if (typeof val === "number") {
        el.$geometry[propName] = val;
    } else if (!val) {
        el.$geometry[propName] = propName === "x" || propName === "y" ? 0 : null;
    } else if (typeof val === "object" && "value" in val) {
        el.$geometry[propName] = GeometryValue.cal(val, parentSize);
    } else {
        throw new Error(`Unexpected geometry value: ${val}`);
    }
}

export function getParentSize(el: BaseElement) {
    const isRoot = el instanceof Component && el.isRoot;
    const parent = el.logicalParent && el.logicalParent.parent ? el.logicalParent.parent : el.parent;
    let pWidth: number, pHeight: number;
    if (el.inPolorCoordSystem) {
        pWidth = el.$coord!.$polar!.rad ? Math.PI : 360;
        pHeight = el.$coord!.$polar!.r;
    } else {
        pWidth = isRoot ? el.$v.size.width : parent.$geometry.width;
        pHeight = isRoot ? el.$v.size.height : parent.$geometry.height;
    }
    return [pWidth, pHeight];
}

export function layoutElement(el: BaseElement, skipFixed = false) {
    const [pWidth, pHeight] = getParentSize(el);
    let [hProps, vProps] = el.$geometryProps;
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
    const g = el.$geometry;
    if (el.positionDetached) {
        g._x = g.x;
        g._y = g.y;
        return;
    }
    let anchor: Anchor | undefined;
    const [x, y] = el.translatePoint(g.x, g.y);
    if ((anchor = el.prop.anchor)) {
        g._x = posWithAnchor(true, x, el.layoutWidth, anchor);
        g._y = posWithAnchor(false, y, el.layoutHeight, anchor);
    } else {
        g._x = x;
        g._y = y;
    }
}

export function getFinalPosition(el: BaseElement<any>): [number, number] {
    return [
        el.$geometry._x + Object.values(el.$geometry._xOffset).reduce((p, c) => p + c, 0),
        el.$geometry._y + Object.values(el.$geometry._yOffset).reduce((p, c) => p + c, 0),
    ];
}
