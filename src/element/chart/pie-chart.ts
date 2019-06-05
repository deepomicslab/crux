import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface PieChartOption extends ComponentOption {
    startAngle: number;
    endAngle: number;
    data: PieChartData;
}

export interface PieChartPoint {
    value: number;
    _minValue: number;
}

export type PieChartData = PieChartPoint[];

export class PieChart extends Component<PieChartOption> {
    public render = template`
    Component {
        // width = 100%; height = 100%
        coord = "polar"
        xScale = _xScale

        @for (data, index) in prop.data {
            @let start = _xScale(data._minValue)
            @let end = _xScale(data.value + data._minValue)
            @let d = { start, end, data, index }
            Component {
                key = index
                @yield children with d default {
                    Arc {
                        x1 = start; x2 = end; r1 = 10; r2 = 100
                    }
                }
            }
        }
    }
    `;

    private _xScale: any;

    public willRender() {
        const sum = this.prop.data.reduce((p, c) => {
            c._minValue = p;
            return p + c.value;
        }, 0);
        this._xScale = this._createScaleLinear(true,
            [0, sum],
            [this.prop.startAngle || 0, this.prop.endAngle || 360]);
    }
}
