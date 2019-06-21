import { BaseElement } from "../../base-element";
import { BaseOption } from "../../base-options";

export interface ChartPaddingOptions {
    "padding": number;
    "padding-x": number;
    "padding-y": number;
    "padding-l": number;
    "padding-r": number;
    "padding-t": number;
    "padding-b": number;
}

export function getPaddings(el: BaseElement<BaseOption & ChartPaddingOptions>) {
    const result = [0, 0, 0, 0] as [number, number, number, number];
    let p: number;
    if (p = el.prop.padding) {
        result.fill(p);
    }
    if (p = el.prop["padding-x"]) result[1] = result[3] = p;
    if (p = el.prop["padding-y"]) result[0] = result[2] = p;
    if (p = el.prop["padding-t"]) result[0] = p;
    if (p = el.prop["padding-r"]) result[1] = p;
    if (p = el.prop["padding-b"]) result[2] = p;
    if (p = el.prop["padding-l"]) result[3] = p;
    return result;
}
