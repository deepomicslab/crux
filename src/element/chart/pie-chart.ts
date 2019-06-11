import { template } from "../../template/tag";
import { ColorScheme } from "../../utils/color-scheme";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { ChartPaddingOptions, getPaddings } from "./utils/option-padding";

export interface PieChartOption extends ComponentOption, ChartPaddingOptions {
    startAngle: number;
    endAngle: number;
    innerRadius: number;
    data: PieChartData;
    totalValue: number;
    pieProps: any;
}

export interface PieChartPoint {
    name?: string;
    value: number;
    _minValue: number;
}

export type PieChartData = PieChartPoint[];

export class PieChart extends Component<PieChartOption> {
    public render = template`
    Component {
        Component {
            @let p = paddings
            x = p[3]
            y = p[0]
            width = @geo(100, -p[1]-p[3])
            height = @geo(100, -p[0]-p[2])
            Component {
                width = 100%
                height = 100%
                coord = "polar"
                xScale = _xScale
                debug = true
                @yield background

                @for (data, index) in _data {
                    @let start = _xScale(data._minValue)
                    @let end = _xScale(data.value + data._minValue)
                    @let color = colorScheme.getColor(data.name)
                    @let d = { start, end, data, index }
                    Component {
                        key = index
                        height = 100%
                        @yield children with d default {
                            Arc {
                                x1 = start; x2 = end
                                r1 = prop.innerRadius
                                r2 = 100%
                                fill = color
                                @props prop.pieProps
                            }
                        }
                        Component {
                            x = (start + end) / 2
                            y = @geo(50, prop.innerRadius * 0.5)
                            coord = "caetesian"
                            @yield label with d
                        }
                    }
                }
            }
            @yield legend with legendData
        }
    }
    `;

    private _xScale: any;
    private _data: any[];
    private colorScheme: ColorScheme<any>;

    public defaultProp() {
        return { ...super.defaultProp(), innerRadius: 0 };
    }

    public willRender() {
        let sum = 0;
        this._data = this.prop.data.map((d, i) => {
            const _minValue = sum;
            const name = "name" in d ? d.name : i;
            sum += d.value;
            return { _minValue, value: d.value, name, raw: d};
        });
        const max =  this.prop.totalValue || sum;
        this._data.forEach(d => d.percentage = d.value * 100.0 / max);
        this._xScale = this._createScaleLinear(true,
            [0, max],
            [this.prop.startAngle || 0, this.prop.endAngle || 360]);
        // color scheme
        const categories = this.prop.data.map((d, i) => "name" in d ? d.name : i) as string[];
        this.colorScheme = ColorScheme.create(categories);
    }

    private get paddings() {
        return getPaddings(this);
    }

    private get legendData() {
        return this.colorScheme.legendData();
    }
}
