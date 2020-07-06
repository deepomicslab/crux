import { ColorSchemeCategory, getThemeColor, getThemeScheme } from "../color";
import { Anchor, GeometryUnit, GeometryValue } from "../defs/geometry";
import { max, min, minmax, toDeg } from "../utils/math";

const ANCHOR = {
    top: Anchor.Top,
    t: Anchor.Top,
    middle: Anchor.Middle,
    m: Anchor.Middle,
    bottom: Anchor.Bottom,
    b: Anchor.Bottom,
    left: Anchor.Left,
    l: Anchor.Left,
    center: Anchor.Center,
    c: Anchor.Center,
    right: Anchor.Right,
    r: Anchor.Right,
};

export default {
    geo(percentage: number, offset: number = 0) {
        return GeometryValue.create(percentage, GeometryUnit.Percent, offset);
    },
    clip(type: string) {
        switch (type) {
            case "bound":
                const radius = arguments[1];
                return { type: "bound", inset: 0, rx: radius, ry: radius };
            case "polygon":
                return { type: "polygon", points: arguments[1] };
            default:
                throw new Error(`Unknown clip path type: ${type}`);
        }
    },
    anchor(s1: string, s2: string) {
        const a1 = ANCHOR[s1],
            a2 = ANCHOR[s2];
        if (!a1 || !a2) {
            throw new Error(`Unknown anchor (${s1}, ${s2})`);
        }
        return a1 | a2;
    },
    rotate(self: any, value: number) {
        if (arguments.length >= 4) {
            const x = arguments[2],
                y = arguments[3],
                unit = arguments[4];
            if (unit === "rad") value = toDeg(value);
            return self._rotate(value, x, y);
        } else {
            const unit = arguments[2];
            if (unit === "rad") value = toDeg(value);
            return self._rotate(value);
        }
    },
    scaledX(self: any, value: number | number[]) {
        if (Array.isArray(value)) {
            return value.map(v => self._scale(v, true));
        } else {
            return self._scale(value, true);
        }
    },
    scaledY(self: any, value: number | number[]) {
        if (Array.isArray(value)) {
            return value.map(v => self._scale(v, false));
        } else {
            return self._scale(value, false);
        }
    },
    scaled(self: any, value: number | [number, number][], direction: boolean) {
        if (Array.isArray(value)) {
            return value.map(([x, y]) => [self._scale(x, true), self._scale(y, false)]);
        } else {
            return self._scale(value, direction);
        }
    },
    scaleLinear(d1?: number, d2?: number, r1?: number, r2?: number) {
        const domain = d1 !== undefined && d2 !== undefined ? [d1, d2] : null;
        const range = r1 !== undefined && r2 !== undefined ? [r1, r2] : null;
        return { __scale__: true, type: "linear", domain, range };
    },
    scaleLog(d1?: number, d2?: number, r1?: number, r2?: number) {
        const domain = d1 !== undefined && d2 !== undefined ? [d1, d2] : null;
        const range = r1 !== undefined && r2 !== undefined ? [r1, r2] : null;
        return { __scale__: true, type: "log", domain, range, base: 10 };
    },
    scaleLog2(d1?: number, d2?: number, r1?: number, r2?: number) {
        const domain = d1 !== undefined && d2 !== undefined ? [d1, d2] : null;
        const range = r1 !== undefined && r2 !== undefined ? [r1, r2] : null;
        return { __scale__: true, type: "log", domain, range, base: 2 };
    },
    scaleLogN(base: number, d1?: number, d2?: number, r1?: number, r2?: number) {
        const domain = d1 !== undefined && d2 !== undefined ? [d1, d2] : null;
        const range = r1 !== undefined && r2 !== undefined ? [r1, r2] : null;
        return { __scale__: true, type: "log", domain, range, base };
    },
    gradient(self: any, name: string) {
        if (arguments.length >= 4) {
            const [, id, deg, ...stops] = arguments;
            self.$v.defineGradient(id, deg, stops);
        }
        return self.$v.renderer.getGradient(name, self.$v, self.$v.rendererCtx);
    },
    color(self: any, name: string | number) {
        if (typeof name === "number") {
            return getThemeScheme(self.$v.theme, "main")[name];
        }
        return getThemeColor(self.$v.theme, name);
    },
    colorMap(self: any, k: number | (string | number)[], scheme: string[] | string = "main") {
        const colors = typeof scheme === "string" ? getThemeScheme(self.$v.theme, scheme) : scheme;
        return ColorSchemeCategory.create(k, colors);
    },
    themeColor(theme: string, name: string | string = "theme") {
        if (typeof name === "number") {
            return getThemeScheme(theme, "main")[name];
        }
        return getThemeColor(theme, name);
    },
    themeColorScheme(theme: string, k: number | (string | number)[], scheme: string = "main") {
        const colors = getThemeScheme(theme, scheme);
        return ColorSchemeCategory.create(k, colors);
    },
    min(data: any[], iter: string | ((d: any) => number)) {
        return min(data, iter);
    },
    max(data: any[], iter: string | ((d: any) => number)) {
        return max(data, iter);
    },
    minmax(data: any[], iter: string | ((d: any) => number)) {
        return minmax(data, iter);
    },
    ANCHOR,
};
