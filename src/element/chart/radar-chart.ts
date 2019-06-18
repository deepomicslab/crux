import { template } from "../../template/tag";
import { ColorSchemeCategory } from "../../utils/color";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { getPaddings } from "./utils/option-padding";

export interface RadarsOption extends ComponentOption {
    data: RadarChartData;
    categories: string[];
    stroke: string;
    opacity: number;
}

export interface RadarChartPoint {
    key: string;
    values: number[];
}

export type RadarChartData = RadarChartPoint[];

export class RadarChart extends Component<RadarsOption> {
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
                xScale = @scale-linear(0, _categoryCount)
                yScale = @scale-linear(0, _maxValue)
                @let numOfItem = prop.data.length
                Circle.centered {
                    r = 100%
                    fill = prop.background || "#fff"
                    stroke = prop.stroke || "#aaa"
                }
                AxisRadical {
                    showLabels = true
                }
                @for c in _categoryCount {
                    RadicalLine {
                        key = c
                        x = @scaled-x(c)
                        r1 = 0
                        r2 = 100%
                        stroke = prop.stroke || "#aaa"
                    }
                    Text.centered {
                        key = c
                        text = prop.categories ? prop.categories[c] : c
                        x = @scaled-x(c)
                        y = 100%
                    }
                }
                @for (d, index) in prop.data {
                    @let color = _colorScheme.getColor(d.key)
                    Polygon {
                        key = index
                        points = @scaled(d.values.map((v, i) => [i, v]))
                        fill = color
                        stroke = color
                        fillOpacity = prop.opacity
                        @props prop.opt.area
                    }
                }
            }
            @yield legend with legendData
        }
    }
    `;

    private _categoryCount: number;
    private _maxValue: number;
    private _colorScheme: ColorSchemeCategory<any>;

    public willRender() {
        this._categoryCount = this.prop.data[0].values.length;
        this._maxValue = 0;
        for (const entry of this.prop.data)
            for (const d of entry.values)
                if (this._maxValue < d) this._maxValue = d;
        const categories = this.prop.data.map(d => d.key);
        this._colorScheme = ColorSchemeCategory.create(categories);
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            ticks: 5,
            fill: [],
            opacity: 0.5,
        };
    }

    private get paddings() {
        return getPaddings(this);
    }

    private get legendData() {
        return this._colorScheme.legendData();
    }
}
