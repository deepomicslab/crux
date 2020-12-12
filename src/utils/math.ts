export function toDeg(d: number) {
    return (d * 180) / Math.PI;
}

export function toRad(d: number) {
    return (d * Math.PI) / 180;
}

export function toCartesian(x: number, y: number, isRad: boolean = false): [number, number] {
    const a = isRad ? x - 0.5 * Math.PI : ((x - 90) / 180) * Math.PI;
    return [Math.cos(a) * y, Math.sin(a) * y];
}

export function minmax<T>(data: T[], getter?: string | ((d: T) => number)): [number, number] {
    let max = Number.MIN_VALUE;
    let min = Number.MAX_VALUE;
    const iter = typeof getter === "string" ? (d: T) => d[getter] : getter;
    for (const d of data) {
        const value = iter ? iter(d) : d;
        let vmin, vmax;
        if (Array.isArray(value)) {
            [vmin, vmax] = value;
        } else {
            vmin = vmax = value;
        }
        if (vmin < min) min = vmin;
        if (vmax > max) max = vmax;
    }
    return [min, max];
}

export function min<T>(data: T[], getter?: string | ((d: T) => number)): number {
    let min = Number.MAX_VALUE;
    const iter = typeof getter === "string" ? (d: T) => d[getter] : getter;
    for (const d of data) {
        const value = iter ? iter(d) : d;
        if (value < min) min = value;
    }
    return min;
}

export function max<T>(data: T[], getter?: string | ((d: T) => number)): number {
    let max = Number.MIN_VALUE;
    const iter = typeof getter === "string" ? (d: T) => d[getter] : getter;
    for (const d of data) {
        const value = iter ? iter(d) : d;
        if (value > max) max = value;
    }
    return max;
}
