import { Anchor, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface BoxesOption extends BaseChartOption {
    fill: string;
    showNotch: boolean;
    showMean: boolean;
    notchWidth: number;
}

export class Boxes extends BaseChart<BoxesOption> {
    public render = template`
    Component {
        @for (d, pos) in data.raw.values {
            Component {
                @let means = data.raw.means[pos]

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
                @if notched {
                    Component {
                        Path {
                            d = notchPath(d, data.raw.notches[pos])
                            fill = "none"
                            stroke = "#000"
                            @props prop.opt.notch
                        }
                    }
                }
                @else {
                    Component {
                        anchor = getBoxAnchor()
                        @props boxOpts(d)
                        @yield box with { data: d, pos } default {
                            Rect.full {
                                @props prop.opt.box
                                stroke = "#000"
                                fill = prop.fill || "none"
                            }
                        }
                    }
                }
                Component {
                    @props medianOpts(d)
                    @yield median with d
                }
                @if hasMean {
                    Component {
                        @props meanOpts(means)
                        @yield mean with means default {
                            @if flipped {
                                Line {
                                    @props prop.opt.mean
                                    y1 = 0; y2 = 100%; x1 = 0; x2 = 0; stroke = "#000"
                                }
                            }
                            @else {
                                Line {
                                    @props prop.opt.mean
                                    x1 = 0; x2 = 100%; y1 = 0; y2 = 0; stroke = "#000"
                                }
                            }
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
                    Circle.centered {
                        @props prop.opt.outlier
                        r = 2; fill = "red"
                    }
                }
            }
        }
    }
    `;

    // @ts-ignore
    private get notched() {
        return !!this.data.raw.notches && this.prop.showNotch;
    }

    // @ts-ignore
    private get hasMean() {
        return !!this.data.raw.means && this.prop.showMean;
    }

    // @ts-ignore
    private medianOpts(d) {
        return this.flippedOpts({
            width: GeometryValue.fullSize,
            y: this.getY(d[2]),
        });
    }

    // @ts-ignore
    private meanOpts(mean) {
        return this.flippedOpts({
            width: GeometryValue.fullSize,
            y: this.getY(mean),
        });
    }

    // @ts-ignore
    private whiskleOpts(d) {
        return this.flippedOpts({
            width: GeometryValue.fullSize,
            y: this.getY(d[0]),
            height: this.getHeight(d[4] - d[0], d[0]),
        });
    }

    // @ts-ignore
    private boxOpts(d) {
        return this.flippedOpts({
            width: GeometryValue.fullSize,
            y: this.getY(d[1]),
            height: this.getHeight(d[3] - d[1], d[1]),
        });
    }

    // @ts-ignore
    private notchPath(d, n) {
        const max = this.getY(d[1]);
        const notchMin = this.getY(n[1]);
        const medium = this.getY(d[2]);
        const notchMax = this.getY(n[0]);
        const min = this.getY(d[3]);
        const width = this.columnWidth;
        const nWidth = width * 0.5 * this.prop.notchWidth;
        const seg = (x: number, y: number, isM = false) => (isM ? "M" : "L") + (this.flipped ? `${y},${x} ` : `${x},${y} `);
        // tslint:disable-next-line: prefer-template
        return seg(0, max, true) + seg(0, notchMax) + seg(nWidth, medium) + seg(0, notchMin) + seg(0, min)
        + seg(width, min) + seg(width, notchMin) + seg(width - nWidth, medium) + seg(width, notchMax) + seg(width, max) + "z";
}

    // @ts-ignore
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

    public defaultProp() {
        return {
            ...super.defaultProp(),
            notchWidth: 0.5,
        };
    }
}
