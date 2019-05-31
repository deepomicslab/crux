export function toDeg(d: number) {
    return d * 180 / Math.PI;
}

export function toRad(d: number) {
    return d * Math.PI / 180;
}

export function toCartesian(x: number, y: number): [number, number] {
    const a = (x - 90) / 180 * Math.PI;
    return [Math.cos(a) * y, Math.sin(a) * y];
}
