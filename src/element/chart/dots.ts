import { Anchor } from "../../defs/geometry";
import { template } from "../../template/tag";
import { getGetter } from "../plot";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface DotsOption extends BaseChartOption {
}

export class Dots extends BaseChart<DotsOption> {
    public render = template`
    Component {
        xScale = getScale(true) || createXScale()
        yScale = getScale(false) || createYScale()

        @for (d, index) in data {
            Component {
                key = index
                @let x = flipped ? getY(d.value) : getX(d.pos)
                @let y = flipped ? getX(d.pos) : getY(d.value)
                @if prop.namedChildren.links && index < data.length - 1 {
                    @let fromData = { x: x, y: y, data: d }
                    @let next = data[index + 1]
                    @let nx = flipped ? getY(next.value) : getX(next.pos)
                    @let ny = flipped ? getX(next.pos) : getY(next.value)
                    @let toData = { x: nx, y: ny, data: next }
                    @let linksData = { from: fromData, to: toData }
                    @yield links with linksData
                }
                Component {
                    x = x
                    y = y
                    width = 0; height = 0

                    @yield children with d default {
                        Circle.centered { r = 2; fill ="#aaa" }
                    }
                }
            }
        }
    }
    `;

    public inheritData() {
        super.inheritData();
        this.data = this.data.values as any;
    }
}
