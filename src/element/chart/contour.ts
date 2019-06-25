import d3c = require("d3-contour");
import d3g = require("d3-geo");
import d3s = require("d3-scale");

import { template } from "../../template/tag";
import { ColorSchemeGradient } from "../../utils/color/gradient";
import { extent } from "../../utils/math";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface ContourOption extends BaseChartOption {
    size: [number, number];
    bandWidth: number;
    withColor: boolean;
    colorScale: "linear" | "log";
    startColor: string;
    endColor: string;
    valueRange: [number, number];
    thresholds: number[];
    smooth: boolean;
}

export class Contour extends BaseChart<ContourOption> {
    public render = template`
    Component {
        xScale = getScale(true) || createXScale()
        yScale = getScale(false) || createYScale()

        @let contours = getContours()
        @for (contour, i) in contours {
            Path {
                key = i
                d = contour.path
                fill = getColor(contour.value)
                stroke = prop.stroke || "#000"
                @props prop.opt.path
            }
        }
    }
    `;

    private _colorScheme!: ColorSchemeGradient;
    private _vScale: any;

    public willRender() {
        if (! this.prop.size) {
            throw new Error(`Contour: please provide contour size`);
        }
        super.willRender();
        const dataRange = this.prop.valueRange || extent(this.data.raw.flat());
        this._vScale = this.prop.colorScale === "linear" ? d3s.scaleLinear() : d3s.scaleLog();
        this._vScale.domain(dataRange).range([0, 1]);
        this._colorScheme = ColorSchemeGradient.create(this.prop.startColor, this.prop.endColor);
    }

    // @ts-ignore
    private getContours() {
        const contours =  d3c.contours()
            .size(this.prop.size);
        let p: any;
        ["bandWidth", "thresholds", "smooth"].forEach(opt => {
            if (p = this.prop[opt]) {
                contours[opt.toLowerCase()](p);
            }
        });
        return contours(this.data.raw)
            .filter(x => x.coordinates.length)
            .map(({type, value, coordinates}) => ({
                type, value,
                coordinates: coordinates.map(rings =>
                    rings.map(points =>
                        points.map(([x, y]) => ([
                            x * this.$geometry.width / this.prop.size[0],
                            y * this.$geometry.height / this.prop.size[1],
                        ])),
                    ),
                ),
            })).map(x => ({
                value: x.value, path: d3g.geoPath()(x),
            }));
    }

    // @ts-ignore
    private getColor(d) {
        return this.prop.withColor ? this._colorScheme.getColor(this._vScale(d)) : "none";
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            withColor: false,
            startColor: "#fff",
            endColor: "#000",
            colorScale: "linear",
        };
    }
}
