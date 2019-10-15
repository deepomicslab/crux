const exprHelpers: Record<string, [string, boolean?]> = {
    "scaleLinear": [`_h.scaleLinear(`],
    "scaled": [`_h.scaled(this, `, true],
    "scaledX": [`_h.scaledX(this, `, true],
    "scaledY": [`_h.scaledY(this, `, true],
    "clip": [`_h.clip(`],
    "rotate": [`_h.rotate(this, `, true],
    "anchor": [`_h.anchor(`],
    "geo": [`_h.geo(`],
    "gradient": [`_h.gradient(this, `, true],
    "bind": [`this._bindMethod(`],
    "rad": [`_h.toRad(`],
    "deg": [`_h.toDeg(`],
};

export function transformHelper(name: string) {
    return exprHelpers[name];
}
