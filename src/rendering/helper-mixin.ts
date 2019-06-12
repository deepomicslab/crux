import { Anchor, GeometryUnit, GeometryValue } from "../defs/geometry";
import { toDeg } from "../utils/math";

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
    clip(type: string, radius: number = 0) {
        if (type !== "bound") {
            throw new Error(`Unknown clip path type`);
        }
        return { type: "bound", inset: 0, rx: radius, ry: radius };
    },
    anchor(s1: string, s2: string) {
        const a1 = ANCHOR[s1], a2 = ANCHOR[s2];
        if (!a1 || !a2) {
            throw new Error(`Unknown anchor (${s1}, ${s2})`);
        }
        return a1 | a2;
    },
    rotate(self, value: number, unit: string) {
        if (unit === "rad") value = toDeg(value);
        return self._rotate(value);
    },
    scaledX(self, value: number | number[]) {
        if (Array.isArray(value)) {
            return value.map(v => self._scale(v, true));
        } else {
            return self._scale(value, true);
        }
    },
    scaledY(self, value: number | number[]) {
        if (Array.isArray(value)) {
            return value.map(v => self._scale(v, false));
        } else {
            return self._scale(value, false);
        }
    },
    scaled(self, value: number | [number, number][], direction: boolean) {
        if (Array.isArray(value)) {
            return value.map(([x, y]) => [
                self._scale(x, true),
                self._scale(y, false),
            ]);
        } else {
            return self._scale(value, direction);
        }
    },
    scaleLinear(d1?: number, d2?: number, r1?: number, r2?: number) {
        const domain = (d1 !== undefined && d2 !== undefined) ? [d1, d2] : null;
        const range = (r1 !== undefined && r2 !== undefined) ? [r1, r2] : null;
        return { __scale__: true, type: "linear", domain, range };
    },
    ANCHOR,
};
