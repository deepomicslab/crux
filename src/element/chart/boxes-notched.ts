import { Anchor, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface BoxesNotchedOption extends BaseChartOption {
    fill: string;
    notch_width: number;
}

export class BoxesNotched extends BaseChart<BoxesNotchedOption> {
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
                    @let boxProps = boxOpts(d)
                    @let medianProps = medianOpts(d)
                    @let notchProps = {width: columnWidth, height: boxProps.height, mheight: boxProps.y - medianProps.y, count: d.length + countOutliers(data.raw.outliers, pos)}
                    @let notchData = {path: getPath(notchProps, d), pos}

                    anchor = getBoxAnchor()
                    @props boxProps
                    @yield box with notchData default {
                        Path {d = notchData.path; fill = prop.fill || "#00000000"; stroke = "#aaa" }
                    }
                }
                Component {
                    @props medianOpts(d)
                    @yield median with d default {
                        @if flipped {
                            Line { y1 = 0; y2 = 100%; x1 = 0; x2 = 0 }
                        }
                        @else {
                            Line { x1 = @geo(0, columnWidth * (1-prop.notch_width)/2); x2 = @geo(0, columnWidth * (1+prop.notch_width)/2); y1 = 0; y2 = 0;}
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

    public defaultProp() {
        return {
            ...super.defaultProp(),
            fill: "#00000000",
            notch_width: 0.5,
        };
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
    private getPath(notchProps, d) {
        const h1 = notchProps.width * (1 - this.prop.notch_width) / 2;
        const h2 = h1 + notchProps.width * this.prop.notch_width;
        const notch_height = 3.14 * notchProps.height / Math.sqrt(notchProps.count);
        let v1 = notchProps.mheight - notch_height / 2;
        let v2 = v1 + notch_height;
        const s_mheight = notchProps.height - notchProps.mheight;
        v1 = notchProps.height - v1;
        v2 = notchProps.height - v2;

        let path = `M0 ${notchProps.height} L${notchProps.width} ${notchProps.height} L${notchProps.width} ${v1} `;
        path += `L${h2} ${s_mheight} L${notchProps.width} ${v2} `;
        path += `L${notchProps.width} 0 L0 0 `;
        path += `L0 ${v2} L${h1} ${s_mheight} L0 ${v1} Z`;
        return path;
    }

    // @ts-ignore
    private countOutliers(outliers, pos) {
        let count = 0;
        for (const o of outliers) {
            if (o[0] < pos)
                continue;
            if (o[0] !== pos)
                break;
            count += 1;
        }
        return count;
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

    // @ts-ignore
    protected getBoxAnchor() {
        return this.flipped ?
            (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Top :
            (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Left;
    }
}
