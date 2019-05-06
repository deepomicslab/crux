import { BaseElement } from "../element/base-element";
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
