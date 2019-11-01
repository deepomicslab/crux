import * as d3 from "d3-scale";

import { ColorSchemeGradient, schemeGradient } from "../../color";
import { template } from "../../template/tag";
import { minmax } from "../../utils/math";
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
                        fill = _colorScheme.get(_vScale(data))
                        @props prop.rectOptions
                    }
                }
            }
        }
    }
    `;

    // @ts-ignore
    private _xSize!: number;
    // @ts-ignore
    private _ySize!: number;
    // @ts-ignore
    private _paddings!: number[];
    // @ts-ignore
    private _vScale!: any;
    // @ts-ignore
    private _colorScheme!: ColorSchemeGradient;

    public willRender() {
        const p = this._paddings = getPaddings(this);
        this._xSize = (this.$geometry.width - p[1] - p[3]) / this.prop.data[0].length;
        this._ySize = (this.$geometry.height - p[0] - p[2]) / this.prop.data.length;
        const dataRange = this.prop.dataRange || minmax(this.prop.data.flat());
        this._vScale = d3.scaleLinear().domain(dataRange).range([0, 1]);
        this._colorScheme = schemeGradient(this.prop.startColor, this.prop.endColor);
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            startColor: "#fff",
            endColor: "#fa0",
        };
    }
}
