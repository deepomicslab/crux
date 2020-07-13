import { scaleLinear, scaleLog, scaleOrdinal } from "d3-scale";

import { Component } from "./component";

export interface Scalable {
    setDomain(domain: [number, number]): void;
    setRange(range: [number, number]): void;
}

type Range = [number, number];
type Scale = d3.ScaleContinuousNumeric<number, number> & { __type__?: string };

export class ScaleMixin {
    public _createScale(type: "linear" | "log", horizontal: boolean, domain: Range, range?: Range): Scale {
        const self = (this as unknown) as Component;
        const size = self.boundaryForScale(horizontal);
        const scale: Scale =
            type === "linear"
                ? scaleLinear()
                      .domain(domain || size)
                      .range(range || size)
                : scaleLog()
                      .domain(shift1(domain || size))
                      .range(range || size);
        scale.__type__ = type;
        return scale;
    }

    public _createScaleOrdinal(domain: string[], range: number[]) {
        return scaleOrdinal().domain(domain).range(range);
    }
}

export function scaled(scale: Scale, value: number): number {
    if (scale.__type__ === "log" || scale["base"]) {
        return scale(value + 1);
    }
    return scale(value);
}

export function scaleDomain(scale: Scale): number[] {
    if (scale.__type__ === "log" || scale["base"]) {
        return scale.domain().map(x => x - 1);
    }
    return scale.domain();
}

export function shift1(range: Range) {
    return range.map(x => x + 1);
}
