import { oneLineTrim } from "common-tags";
import { BaseElement } from "../element/base-element";
import { Component } from "../element/component";
import { ComponentOption } from "../element/component-options";
import { BaseElementOption } from "../element/primitive/base-elm-options";

export function svgPropFillAndStroke(elm: BaseElement<BaseElementOption>) {
    const result = {} as any;
    let v: any;

    if (v = elm.prop.fill) result.fill = v;
    if (v = elm.prop.stroke) result.stroke = v;
    return result;
}

export function svgPropXAndY(elm: BaseElement<BaseElementOption>) {
    const result = {} as any;
    let v: any;

    if (v = elm.$geometry.x) result.x = v;
    if (v = elm.$geometry.y) result.y = v;
    return result;
}

export function svgRotation(elm: BaseElement<BaseElementOption>) {
    const result = {} as any;
    let v: any;

    if (v = elm.prop.rotation) result.transform = `rotate(${v[0]},${v[1]},${v[2]})`;
    return result;
}

export function svgPropClip(elm: Component<ComponentOption>) {
    const result = {} as any;
    let v: any;

    if (v = elm.prop.clip) {
        let clipPath: string;
        if (v.type === "bound") {
            clipPath = oneLineTrim`<rect x="0" y="0"
                width="${elm.$geometry.width}"
                height="${elm.$geometry.height}"
                rx="${v.rx}" ry="${v.ry}">`;
        }
        const id = `clip-${elm.uid}`;
        elm.$v.appendDef(id, "clipPath", {}, clipPath);
        result["clip-path"] = `url(#${id})`;
    }
    return result;
}

export function svgInnerHTML(elm: BaseElement<BaseElementOption & { html: string }>) {
    const result = {} as any;
    let v: any;

    if (v = elm.prop.html) result.innerHTML = v;
    return result;
}

export function svgPropPassthrough(props: Record<string, string>) {
    return (elm: BaseElement<BaseElementOption>) => {
        const result = {};
        Object.keys(props).forEach(k => {
            const v = props[k];
            if (v in elm.prop) {
                result[k] = elm.prop[v];
            }
        });
        return result;
    };
}
