import d3 = require("d3-interpolate");
import { ColorScheme } from "./color-scheme";

export class ColorSchemeGradient implements ColorScheme {
    public scale: any;

    constructor(public startColor: string, public endColor: string) {
        this.scale = d3.interpolateHsl(startColor, endColor);
    }

    public getColor(c: number) {
        return this.scale(c);
    }

    public legendData() {
        return {};
    }

    public static create(s: string, e: string): ColorSchemeGradient {
        return new ColorSchemeGradient(s, e);
    }
}
