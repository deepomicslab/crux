import d3 = require("d3-array");

import { Anchor, GeometryUnit, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

type ValueDef = string | ((d: any, i: number, g: any[]) => string);

export interface BarsOption extends BaseChartOption {
    barWidth: number;
    barFill: ValueDef;
    barStroke: ValueDef;
}

export class Bars extends BaseChart<BarsOption> {
    protected data: any[];

    public render = template`
        Component {
            xScale = getScale(true) || createXScale()
            yScale = getScale(false) || createYScale()

            @for (d, index) in data {
                Rect {
                    key = index
                    anchor = getAnchor()

                    @let x = getX(d)
                    @let y = getY()
                    @let width = getWidth()
                    @let height = getHeight(d)

                    x = flipped ? y : x
                    y = flipped ? x : y
                    width = flipped ? height : width
                    height = flipped ? width : height

                    fill = propValue("barFill", d, index, data)
                    stroke = propValue("barStroke", d, index, data)
                    strokeWidth = propValue("barStrokeWidth", d, index)
                }
            }
        }
    `;

    public defaultProp() {
        return {
            ...super.defaultProp(),
            barFill: "#aaa",
            barStroke: "#999",
            barStrokeWidth: 0,
        };
    }

    private getAnchor() {
        return this.flipped ?
            (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Middle :
            (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Center;
    }

    private getX(d: any) {
        return this._scale(d.pos, !this.flipped);
    }

    private getY() {
        return this.inverted ? 0 : GeometryValue.fullSize;
    }

    private getWidth() {
        return this.prop.barWidth || this.columnWidth;
    }

    private getHeight(d: any) {
        return this.inverted ?
            this._scale(d.value, this.flipped) :
            GeometryValue.create(100, GeometryUnit.Percent, -this._scale(d.value, this.flipped));
    }

    private get maxValue() {
        return d3.max(this.data);
    }
}
