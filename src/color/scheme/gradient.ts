import { interpolateRgb } from "d3-interpolate";
import { scaleLinear, scaleLog, scaleQuantize, scaleThreshold } from "d3-scale";
import { ColorScheme } from "./scheme";

export type ColorSchemeGradientOptions = {
    type: "linear";
    domain: [number, number];
} | {
    type: "log";
    domain: [number, number];
    base?: number;
} | {
    type: "threshold";
    thresholds: number[];
    minDistinct: boolean;
    maxDistinct: boolean;
    domain: [number, number];
} | {
    type: "quantize";
    domain: [number, number];
    groups: number;
};

export class ColorSchemeGradient implements ColorScheme {
    public scale: any;
    public numberScale: any;

    private type: ColorSchemeGradientOptions["type"] = "linear";
    private colors?: number[];
    private bounds?: number[];

    constructor(public startColor: string, public endColor: string, options?: ColorSchemeGradientOptions) {
        this.scale = interpolateRgb(startColor, endColor);
        if (options) {
            this.type = options.type;
            switch (options.type) {
                case "linear":
                    this.numberScale = scaleLinear().range([0, 1]).domain(options.domain).clamp(true);
                    break;
                case "log":
                    this.numberScale = scaleLog().range([0, 1]).domain(options.domain).clamp(true);
                    if (options.base) this.numberScale.base(options.base);
                    break;
                case "threshold":
                    const l1 = options.thresholds.length + (+options.minDistinct) + (+options.maxDistinct);
                    const q1 = 1 / l1;
                    this.colors = Array.from(Array(l1 + 1)).map((_, i) => i * q1);
                    const bounds = [
                        ...options.minDistinct ? [options.domain[0] + Number.EPSILON] : [],
                        ...options.thresholds,
                        ...options.maxDistinct ? [options.domain[1] - Number.EPSILON] : [],
                    ];
                    this.bounds = [options.domain[0]].concat(bounds).concat([options.domain[1]]);
                    this.numberScale = scaleThreshold().range(this.colors).domain(bounds);
                    break;
                case "quantize":
                    const l2 = options.groups - 1;
                    const q2 = 1 / l2;
                    this.colors = Array.from(Array(l2 + 1)).map((_, i) => i * q2);
                    const range = options.domain[1] - options.domain[0];
                    this.bounds = this.colors.map(d => options.domain[0] + d * range);
                    this.numberScale = scaleQuantize().range(this.colors).domain(options.domain);
                    break;
            }
        }
    }

    public get(c: number) {
        return this.scale(this.numberScale ? this.numberScale(c) : c);
    }

    public legendData() {
        const b = this.bounds!;
        switch (this.type) {
            case "linear": case "log": return {};
            case "threshold": case "quantize":
                return this.colors!.map((d, i) => ({
                    range: [b[i], b[i + 1]],
                    label: i === b.length - 1 ? `>=${b[i]}` : `[${b[i]}, ${b[i + 1]})`,
                    fill: this.scale(d),
                }));
        }
    }

    public static create(s: string, e: string, options?: ColorSchemeGradientOptions): ColorSchemeGradient {
        return new ColorSchemeGradient(s, e, options);
    }
}
