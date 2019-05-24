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
                key = index
                @let x = flipped ? getY(d) : getX(d)
                @let y = flipped ? getX(d) : getY(d)
                @if prop.namedChildren.links && index < data.length - 1 {
                    @let fromData = { x: x, y: y, data: d }
                    @let next = data[index + 1]
                    @let nx = flipped ? getY(next) : getX(next)
                    @let ny = flipped ? getX(next) : getY(next)
                    @let toData = { x: nx, y: ny, data: next }
                    @let linksData = { from: fromData, to: toData }
                    @yield links with linksData
                }
                Component {
                    x = x
                    y = y
                    width = 0; height = 0

                    @yield children with d
                }
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
