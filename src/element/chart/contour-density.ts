import d3c = require("d3-contour");
import d3g = require("d3-geo");
import d3s = require("d3-scale");

import { template } from "../../template/tag";
import { ColorSchemeGradient } from "../../utils/color/gradient";
import { extent } from "../../utils/math";
import { BaseChart, BaseChartOption } from "./base-chart";

// XP-Plot version
export interface ContourDensityOption extends BaseChartOption {
    bandWidth: number;
    withColor: boolean;
    colorScale: "linear" | "log";
    startColor: string;
    endColor: string;
    thresholds: number[];
}

export class ContourDensity extends BaseChart<ContourDensityOption> {
    public render = template`
    Component {
        xScale = getScale(true) || createXScale()
        yScale = getScale(false) || createYScale()
        // @let contours = getContourDensity()
        @for (contour, i) in _contours {
            Path {
                key = i
                d = contour.path
                fill = getColor(contour.value)
                stroke = prop.stroke || "#000"
                @props prop.pathOptions
            }
        }
    }
    `;

    private _colorScheme!: ColorSchemeGradient;
    private _vScale!: d3.ScaleContinuousNumeric<number, number>;
    private _contours!: { value: number, path: string }[];

    public willRender() {
        super.willRender();
        this._contours = this.getContourDensity();
        const densityRange = extent(this._contours.map((d: { value: any }) => d.value).flat());
        this._vScale = this.prop.colorScale === "linear" ? d3s.scaleLinear() : d3s.scaleLog();
        this._vScale.domain(densityRange).range([0, 1]);
        this._colorScheme = ColorSchemeGradient.create(this.prop.startColor, this.prop.endColor);
    }

    private getContourDensity() {
        const contours = d3c.contourDensity()
            .x(d => this.getX(d[0]))
            .y(d => this.getY(d[1]))
            .size([this.$geometry.width, this.$geometry.height]);
        let p: any;
        ["bandWidth", "thresholds"].forEach(opt => {
            if (p = this.prop[opt]) {
                contours[opt.toLowerCase()](p);
            }
        });
        return contours(this.data.raw)
            .filter(x => x.coordinates.length)
            .map(x => ({ value: x.value, path: d3g.geoPath()(x)! }));
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
