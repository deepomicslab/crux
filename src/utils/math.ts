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

export function extent(data: any[], iter?: (d: any) => number): [number, number] {
    let max = Number.MIN_VALUE;
    let min = Number.MAX_VALUE;
    for (const d of data) {
        const value = iter ? iter(d) : d;
        if (value < min) min = value;
        else if (value > max) max = value;
    }
    return [min, max];
}
