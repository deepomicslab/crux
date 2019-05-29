import { GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface BarsOption extends BaseChartOption {
}

export class Bars extends BaseChart<BarsOption> {
    public render = template`
        Component {
            xScale = getScale(true) || createXScale()
            yScale = getScale(false) || createYScale()

            @for (d, index) in data.values {
                Component {
                    @let x = getX(d.pos)
                    @let y = getY(d.minValue)
                    @let width = getWidth()
                    @let height = getHeight(d.value - d.minValue, d.minValue)

                    key = index
                    anchor = getAnchor()
                    x = flipped ? y : x
                    y = flipped ? x : y
                    width = flipped ? height : width
                    height = flipped ? width : height

                    @yield children with d default {
                        Rect.full {}
                    }
                }
            }
        }
    `;

    private getYStartPos() {
        return this.inverted ? 0 : GeometryValue.fullSize;
    }
}
