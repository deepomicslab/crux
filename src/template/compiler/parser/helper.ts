const exprHelpers: Record<string, [string, boolean?]> = {
    "scale-linear": [`_h.scaleLinear(`],
    "scaled": [`_h.scaled(this, `, true],
    "scaled-x": [`_h.scaledX(this, `, true],
    "scaled-y": [`_h.scaledY(this, `, true],
    "clip": [`_h.clip(`],
    "rotate": [`_h.rotate(this, `, true],
    "anchor": [`_h.anchor(`],
    "geo": [`_h.geo(`],
    "gradient": [`_h.gradient(this, `, true],
    "bind": [`this._bindMethod(`],
};

export function transformHelper(name: string) {
    return exprHelpers[name];
}
