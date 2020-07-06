import { useTemplate } from "../../ext/decorator";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface DotsOption extends BaseChartOption {}

@useTemplate(`
Component {
    xScale = getScale(true) || createXScale()
    yScale = getScale(false) || createYScale()

    @for (d, index) in data.values {
        Component {
            key = index
            @let x = flipped ? getY(d.value) : getX(d.pos)
            @let y = flipped ? getX(d.pos) : getY(d.value)
            @if prop.namedChildren.links && index < data.values.length - 1 {
                @let fromData = { x: x, y: y, data: d }
                @let next = data.values[index + 1]
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
                    Circle.centered {
                        r = 2; fill ="#aaa"
                        @props prop.opt.dots
                    }
                }
            }
        }
    }
}
`)
export class Dots extends BaseChart<DotsOption> {}
