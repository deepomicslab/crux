import { Anchor } from "../../defs/geometry";
import { template } from "../../template/tag";
import { getGetter } from "../plot";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface DotsOption extends BaseChartOption {
}

export class Dots extends BaseChart<DotsOption> {
    protected data: any[];

    public render = template`
    Component {
        xScale = getScale(true) || createXScale()
        yScale = getScale(false) || createYScale()

        @for (d, index) in data {
            Component {
                @let x = getX(d)
                @let y = getY(d)
                key = index
                x = flipped ? y : x
                y = flipped ? x : y
                width = 0; height = 0

                @yield children with d
            }
        }
    }
    `;

    private getAnchor() {
        return this.flipped ?
            (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Middle :
            (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Center;
    }

    private getX(d: any) {
        return this._scale(d.pos, !this.flipped);
    }

    private getY(d: any) {
        return this._scale(d.value, this.flipped);
    }
}
