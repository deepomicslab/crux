export const GEOMETRY_LITERAL = new RegExp(/(\d[\.\d]*|\((.+?)\))%(?:(\+|\-)(\d[\.\d]*|\((.+?)\)))?/);

export enum GeometryUnit {
    Pixel = 0, Percent = 1,
}

export class GeometryValue {
    public value: number = 0;
    public unit: GeometryUnit = GeometryUnit.Pixel;
    public offset: number = 0;
    public _auto?: boolean;

    static get auto(): GeometryValue {
        return { value: 0, unit: GeometryUnit.Pixel, offset: 0, _auto: true };
    }

    static get zero(): GeometryValue {
        return { value: 0, unit: GeometryUnit.Pixel, offset: 0 };
    }

    static get fullSize(): GeometryValue {
        return { value: 100, unit: GeometryUnit.Percent, offset: 0 };
    }

    public static parse(def: number | string): GeometryValue | null {
        if (typeof def === "number") {
            return GeometryValue.create(def);
        } else if (typeof def === "string") {
            if (def.length === 0) { return null; }
            if (def.match(/^-?[\d\.]+$/)) {
                // is a number
                return GeometryValue.create(parseFloat(def));
            }
            const matches = def.match(/^(-?\d+(\.\d+)?)%( ?[+|-] ?\d+(\.\d+)?)?$/);
            if (matches === null) {
                throw new Error(`Geometry value ${def} has wrong format`);
            }
            return GeometryValue.create(
                parseFloat(matches[1]),
                GeometryUnit.Percent,
                matches[3] ? parseFloat(matches[3]) : 0,
            );
        }
        return null;
    }

    public static create(value = 0, unit = GeometryUnit.Pixel, offset = 0): GeometryValue {
        return { value, unit, offset };
    }

    public static cal(val: GeometryValue, parentSize: number): number {
        if (val.unit === GeometryUnit.Percent) {
            return val.value * 0.01 * parentSize + val.offset;
        } else {
            return val.value + val.offset;
        }
    }
}

export function isFixed(geo: GeometryOptValue): boolean {
    return !(typeof geo === "object" && geo.unit === GeometryUnit.Percent);
}

export function offset(val: GeometryOptValue, offset: number): GeometryOptValue {
    if (typeof val === "number") return val + offset;
    else {
        val.offset += offset;
        return val;
    }
}

export type GeometryOptValue = number | GeometryValue;

type GeometryPropKeys<T> = { [K in keyof T]:
    any extends T[K] ? never :
    GeometryOptValue extends T[K] ? K : never
}[keyof T];

export type GeometryOptions<T> = {
    [K in GeometryPropKeys<T>]: number;
} & {
    _xOffset: Record<string, number>;
    _yOffset: Record<string, number>;
    _x: number;
    _y: number;
};
