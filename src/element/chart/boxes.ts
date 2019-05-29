import { Anchor, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface BoxesOption extends BaseChartOption {
}

export class Boxes extends BaseChart<BoxesOption> {
    public render = template`
    Component {
        @let y = getYStartPos()

        @for (d, pos) in data.raw.values {
            Component {
                @let x = getX(pos)
                @let width = getWidth()
                @let height = getContainerYSize()

                key = "b" + pos
                anchor = getAnchor()
                x = flipped ? y : x
                y = flipped ? x : y
                width = flipped ? height : width
                height = flipped ? width : height

                Component {
                    width = 100%
                    y = getY(d[0])
                    height = getHeight(d[4] - d[0], d[0])
                    anchor = getBoxAnchor()
                    @yield whiskle with d default {
                        Line { x1 = 0; x2 = 100%; y1 = 0; y2 = 0; stroke = "#000" }
                        Line { x1 = 0; x2 = 100%; y1 = 100%; y2 = 100%; stroke = "#000" }
                        Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#000" }
                    }
                }
                Component {
                    width = 100%
                    y = getY(d[1])
                    height = getHeight(d[3] - d[1], d[1])
                    anchor = getBoxAnchor()
                    @yield box with d default {
                        Rect.full { stroke = "#000" }
                    }
                }
                Component {
                    width = 100%
                    y = getY(d[2])
                    height = 0
                    @yield median with d default {
                        Line { x1 = 0; x2 = 100%; y1 = 0; y2 = 0; stroke = "#000" }
                    }
                }
            }
        }
        @for (o, index) in data.raw.outliers {
            Component {
                @let x = getX(o[0])
                @let y = getY(o[1])
                @let data = { data: o }

                key = "o" + index
                x = flipped ? y : x
                y = flipped ? x : y

                @yield outlier with o default {
                    Circle.centered { r = 2; fill = "red" }
                }
            }
        }
    }
    `;

    private getContainerYSize() {
        return GeometryValue.fullSize;
    }

    private getYStartPos() {
        return this.inverted ? 0 : GeometryValue.fullSize;
    }

    protected getBoxAnchor() {
        return this.flipped ?
            (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Top :
            (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Left;
    }
}
