import d3 = require("d3-scale");

import { template } from "../../template/tag";
import { ColorSchemeGradient } from "../../utils/color/gradient";
import { extent } from "../../utils/math";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { ChartPaddingOptions, getPaddings } from "./utils/option-padding";

export interface HeatMapOption extends ComponentOption, ChartPaddingOptions {
    data: number[][];
    dataRange: [number, number];
    startColor: string;
    endColor: string;
    rectOptions: any;
}

export class HeatMap extends Component<HeatMapOption> {
    public render = template`
    Component {
        Component {
            @let n = 0
            @let p = _paddings
            x = p[3]
            y = p[0]
            width = @geo(100, -p[1]-p[3])
            height = @geo(100, -p[0]-p[2])

            @for (row, i) in prop.data {
                @let y = _ySize * i
                @for (data, j) in row {
                    @expr n += 1
                    Rect {
                        key = n
                        x = _xSize * j
                        y = y
                        width = _xSize
                        height = _ySize
                        fill = _colorScheme.getColor(_vScale(data))
                        @props prop.rectOptions
                    }
                }
            }
        }
    }
    `;

    private _xSize: number;
    private _ySize: number;
    private _paddings: number[];
    private _vScale: any;
    private _colorScheme: ColorSchemeGradient;

    public willRender() {
        const p = this._paddings = getPaddings(this);
        this._xSize = (this.$geometry.width - p[1] - p[3]) / this.prop.data[0].length;
        this._ySize = (this.$geometry.height - p[0] - p[2]) / this.prop.data.length;
        const dataRange = this.prop.dataRange || extent(this.prop.data.flat());
        this._vScale = d3.scaleLinear().domain(dataRange).range([0, 1]);
        this._colorScheme = ColorSchemeGradient.create(this.prop.startColor, this.prop.endColor);
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            startColor: "#fff",
            endColor: "#fa0",
        };
    }
}
