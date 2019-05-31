import d3 = require("d3-scale");

import { Component } from "./component";

export interface Scalable {
    setDomain(domain: [number, number]): void;
    setRange(range: [number, number]): void;
}

type Range = [number, number];

export class ScaleHelper {
    public _createScale_linear(horizontal: boolean, domain: Range, range?: Range) {
        const self = (this as unknown as Component);
        const size = horizontal ?
            self.$polar ? 360 : self.$geometry.width :
            self.$polar ? self.$polar.r : self.$geometry.height;
        return d3.scaleLinear()
            .domain(domain)
            .range(range || [0, size]);
    }
}
