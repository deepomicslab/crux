import d3 = require("d3-array");

import { Anchor, GeometryUnit, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface BarsOption extends BaseChartOption {
    barWidth: number;
}

export class Bars extends BaseChart<BarsOption> {
    protected data: any[];

    public render = template`
        Component {
            xScale = getScale(true) || createXScale()
            yScale = getScale(false) || createYScale()

            @for (d, index) in data {
                Component {
                    @let x = getX(d)
                    @let y = getY()
                    @let width = getWidth()
                    @let height = getHeight(d)

                    key = index
                    anchor = getAnchor()
                    x = flipped ? y : x
                    y = flipped ? x : y
                    width = flipped ? height : width
                    height = flipped ? width : height

                    @yield children with d
                }
            }
        }
    `;

    public defaultProp() {
        return {
            ...super.defaultProp(),
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
