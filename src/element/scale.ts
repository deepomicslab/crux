import d3 = require("d3-scale");

import { Component } from "./component";

export interface Scalable {
    setDomain(domain: [number, number]): void;
    setRange(range: [number, number]): void;
}

export class ScaleHelper {
    public scaleLinear(domain: [number, number], range?: [number, number]) {
        const self = (this as unknown as Component);
        return d3.scaleLinear()
            .domain(domain)
            .range(range || [0, self.$geometry.width]);
    }
}
