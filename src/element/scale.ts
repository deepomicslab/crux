import * as d3 from "d3-scale";

import { Component } from "./component";

export interface Scalable {
    setDomain(domain: [number, number]): void;
    setRange(range: [number, number]): void;
}

type Range = [number, number];

export class ScaleMixin {
    public _createScaleLinear(horizontal: boolean, domain: Range, range?: Range) {
        const self = (this as unknown as Component);
        const size = self.boundaryForScale(horizontal);
        return d3.scaleLinear()
            .domain(domain || size)
            .range(range || size);
    }

    public _createScaleOrdinal(domain: string[], range: number[]) {
        return d3.scaleOrdinal().domain(domain).range(range);
    }
}
