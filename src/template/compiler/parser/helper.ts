const exprHelpers: Record<string, [string, boolean?]> = {
    scaleLinear: [`_h.scaleLinear(`],
    scaleLog: [`_h.scaleLog(`],
    scaleLog2: [`_h.scaleLog2(`],
    scaleLogN: [`_h.scaleLogN(`],
    scaled: [`_h.scaled(this, `, true],
    scaledX: [`_h.scaledX(this, `, true],
    scaledY: [`_h.scaledY(this, `, true],
    clip: [`_h.clip(`],
    rotate: [`_h.rotate(this, `, true],
    anchor: [`_h.anchor(`],
    geo: [`_h.geo(`],
    gradient: [`_h.gradient(this, `, true],
    color: [`_h.color(this, `, true],
    colorMap: [`_h.colorMap(this, `, true],
    themeColor: [`_h.themeColor(`],
    themeColorScheme: [`_h.themeColorScheme(`],
    bind: [`_bindMethod(`],
    rad: [`_h.toRad(`],
    deg: [`_h.toDeg(`],
    min: [`_h.min(`],
    max: [`_h.max(`],
    minmax: [`_h.minmax(`],
    // legacy helpers
    "scale-linear": [`_h.scaleLinear(`],
    "scaled-x": [`_h.scaledX(this, `, true],
    "scaled-y": [`_h.scaledY(this, `, true],
};

export function transformHelper(name: string) {
    if (!(name in exprHelpers)) {
        throw new Error(`Unknown helper: @${name}`);
    }
    return exprHelpers[name];
}
