import { Anchor } from "../../../defs/geometry";
import { toDeg } from "../../../utils/math";
import { HELPER } from "../tokens";

const exprHelpers: Record<string, [string, boolean?]> = {
    "scale-linear": [`_h.scaleLinear(`],
    "scaled": [`_h.scaled(this, `, true],
    "scaled-x": [`_h.scaledX(this, `, true],
    "scaled-y": [`_h.scaledY(this, `, true],
    "clip": [`_h.clip(`],
    "rotate": [`_h.rotate(this, `, true],
    "anchor": [`_h.anchor(`],
    "geo": [`_h.geo(`],
};

function checkNameIsScale(name: string) {
    if (name !== "xScale" && name !== "yScale") {
        throw new Error(`@scale helpers should only be used with xScale and yScale.`);
    }
}

export function transformHelper(name: string) {
    return exprHelpers[name];
}
