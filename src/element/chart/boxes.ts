import { Anchor, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface BoxesOption extends BaseChartOption {
}

export class Boxes extends BaseChart<BoxesOption> {
    public render = template`
    Component {
        @for (d, pos) in data.raw.values {
            Component {
                @let means = data.raw.means[pos]
                @let _d = { data: d, pos }

                key = "b" + pos
                anchor = getAnchor()
                @props containerOpts(pos)

                Component {
                    anchor = getBoxAnchor()
                    @props whiskleOpts(d)
                    @yield whiskle with d default {
                        @if flipped {
                            Line { y1 = 0; y2 = 100%; x1 = 0; x2 = 0 }
                            Line { y1 = 0; y2 = 100%; x1 = 100%; x2 = 100% }
                            Line { y1 = 50%; y2 = 50%; x1 = 0; x2 = 100% }
                        }
                        @else {
                            Line { x1 = 0; x2 = 100%; y1 = 0; y2 = 0 }
                            Line { x1 = 0; x2 = 100%; y1 = 100%; y2 = 100% }
                            Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100% }
                        }
                    }
                }
                Component {
                    anchor = getBoxAnchor()
                    @props boxOpts(d)
                    @yield box with _d default {
                        Rect.full {
                            stroke = "#000"
                            fill = prop.fill || "none"
                        }
                    }
                }
                Component {
                    @props medianOpts(d)
                    @yield median with d default {
                        @if flipped {
                            Line { y1 = 0; y2 = 100%; x1 = 0; x2 = 0 }
                        }
                        @else {
                            Line { x1 = 0; x2 = 100%; y1 = 0; y2 = 0 }
                        }
                    }
                }
                Component {
                    @props meanOpts(means)
                    @yield mean with means default {
                        @if flipped {
                            Line { y1 = 0; y2 = 100%; x1 = 0; x2 = 0; stroke = "#000" }
                        }
                        @else {
                            Line { x1 = 0; x2 = 100%; y1 = 0; y2 = 0; stroke = "#000" }
                        }
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

    private medianOpts(d) {
        return this.flippedOpts({
            width: GeometryValue.fullSize,
            y: this.getY(d[2]),
        });
    }

    private meanOpts(mean) {
        return this.flippedOpts({
            width: GeometryValue.fullSize,
            y: this.getY(mean),
        });
    }

    private whiskleOpts(d) {
        return this.flippedOpts({
            width: GeometryValue.fullSize,
            y: this.getY(d[0]),
            height: this.getHeight(d[4] - d[0], d[0]),
        });
    }

    private boxOpts(d) {
        return this.flippedOpts({
            width: GeometryValue.fullSize,
            y: this.getY(d[1]),
            height: this.getHeight(d[3] - d[1], d[1]),
        });
    }

    private containerOpts(pos) {
        return this.flippedOpts({
            x: this.getX(pos),
            y: this.inverted ? 0 : GeometryValue.fullSize,
            width: this.getWidth(),
            height: GeometryValue.fullSize,
        });
    }

    protected getBoxAnchor() {
        return this.flipped ?
            (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Top :
            (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Left;
    }
}
