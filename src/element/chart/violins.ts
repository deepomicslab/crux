import * as d3 from "d3";
import { Anchor, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface ViolinsOption extends BaseChartOption {
    dataLine: boolean;
    lineClosed: boolean;
    quartileClip: boolean;
    maxBin: number;
}

export class Violins extends BaseChart<ViolinsOption> {
    public render = template`
    Component {
        @let bandWidth = getBandWidth(data.raw.bins)
        @for (d, pos) in data.raw.values {
            Component {
                @let q = data.raw.quartiles[pos]
                @let mean = data.raw.means[pos]
                @let bin = data.raw.bins[pos]
                key = pos
                anchor = getAnchor()
                @props containerOpts(pos)

                Component {
                    @let _d = {quartiles: q, bins: bin}
                    @let violinData = getPath(bin, q, bandWidth)
                    @props violinOpts(bin)
                    anchor = getViolinAnchor()
                    Path {
                        @props prop.opt.violin
                        d = violinData.p
                        stroke = "#aaa"
                        fill = "none"
                    }
                    @if prop.dataLine {
                        @for (bin, pos) in violinData.ps {
                            @let x = bin[0]
                            @let y = bin[1]
                            @if flipped {
                                Line {
                                    @props prop.opt.dataLine
                                    x1 = x
                                    x2 = x
                                    y1 = y
                                    y2 = violinData.midX
                                    key = "l" + x + y
                                }
                            }
                            @else {
                                Line {
                                    @props prop.opt.dataLine
                                    x1 =x
                                    x2 = violinData.midX
                                    y1 = y
                                    y2 = y
                                    key = "l" + x + y
                                }
                            }
                        }
                    }
                    // quatile
                    @if prop.quartile {
                        Line {
                            @props quartileOpts(violinData, pos, 0)
                            @props prop.opt.firstQuartile
                        }
                        Line {
                            @props quartileOpts(violinData, pos, 1)
                            @props prop.opt.medianLine
                        }
                        Line {
                            @props quartileOpts(violinData, pos, 2)
                            @props prop.opt.thirdQuartile
                        }
                    }
                }
            }
        }
    }
    `;

    public defaultProp() {
        return {
            ...super.defaultProp(),
            dataLine: false,
            lineClosed: false,
            quartileClip: false,
        };
    }

    // @ts-ignore
    private quartileOpts(d: any, index: number, pos: number) {
        const q = this.data.raw.quartiles[index];
        return this.flippedOpts({
            x1: d.qps[q[pos]][0],
            x2: d.qps[q[pos]][1],
            y1: d.qps[q[pos]][2],
            y2: d.qps[q[pos]][2],
        });
    }

    // @ts-ignore
    private getPath(bins: [number, number][], quartiles: number[], bandWidth: number) {
        const min = bins[0][0];
        const max = bins[bins.length - 1][0];
        const lPoints: [number, number][] = [];
        const rPoints: [number, number][] = [];
        const quartilePoints = {};
        const height = this.getHeight(bins[bins.length - 1][0] - bins[0][0], bins[0][0]);
        const width = this.columnWidth;
        const midXn = width / 2;
        for (const bin of bins) {
            if (this.prop.quartileClip) {
                if (bin[0] < quartiles[0] || bin[0] > quartiles[2]) {
                    continue;
                }
            }
            const x1 = (1 - bin[1] / bandWidth) * width / 2;
            const x2 = (1 + bin[1] / bandWidth) * width / 2;
            const y = (max - bin[0]) / (max - min) * height;
            lPoints.push(this.flipped ? [y, x1] : [x1, y]);
            if (bin[0] === quartiles[0]) {
                quartilePoints[bin[0]] = [x1, x2, y];
            }
            if (bin[0] === quartiles[2]) {
                quartilePoints[bin[0]] = [x1, x2, y];
            }
            if (bin[0] === quartiles[1]) {
                quartilePoints[bin[0]] = [x1, x2, y];
            }
        }
        for (let i = bins.length - 1; i >= 0; i--) {
            const bin = bins[i];
            if (this.prop.quartileClip) {
                if (bin[0] < quartiles[0] || bin[0] > quartiles[2]) {
                    continue;
                }
            }
            let x: number, y: number;
            x = (1 + bin[1] / bandWidth) * width / 2;
            y = (max - bin[0]) / (max - min) * height;
            rPoints.push(this.flipped ? [y, x] : [x, y]);
        }
        let path: string;
        let points: any;
        let lineG: d3.Line<[number, number]>;
        if (this.prop.quartileClip || this.prop.lineClosed) {
            lineG = d3.line().curve(d3.curveCatmullRom.alpha(0));
            path = lineG(lPoints)!.concat(`L${rPoints[0][0]},${rPoints[0][1]}`).concat(lineG(rPoints)!);
            path += `L${lPoints[0][0]},${lPoints[0][1]}`;
        } else {
            lineG = d3.line().curve(d3.curveCatmullRomClosed.alpha(0));
            points = lPoints.concat(rPoints);
            path = lineG(points)!;
        }
        return {
            p: path,
            ps: points,
            midX: midXn,
            qps: quartilePoints,
        };
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
    private whiskleOpts(d) {
        return this.flippedOpts({
            width: GeometryValue.fullSize,
            y: this.getY(d[0]),
            height: this.getHeight(d[1] - d[0], d[0]),
        });
    }

    // @ts-ignore
    private medianOpts(q) {
        return this.flippedOpts({
            width: GeometryValue.fullSize,
            y: this.getY(q[1]),
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
    private violinOpts(bins) {
        return this.flippedOpts({
            width: GeometryValue.fullSize,
            y: this.getY(bins[0][0]),
            height: this.getHeight(bins[bins.length - 1][0] - bins[0][0], bins[0][0]),
        });
    }

    // @ts-ignore
    private getBandWidth(bins) {
        let max = -0;
        for (const columnBins of bins) {
            for (const bin of columnBins) {
                if (bin[1] > max) {
                    max = bin[1];
                }
            }
        }
        return max;
    }

    // @ts-ignore
    private boxOpts(q) {
        return this.flippedOpts({
            width: GeometryValue.fullSize,
            y: this.getY(q[0]),
            height: this.getHeight(q[2] - q[0], q[0]),
        });
    }

    protected getViolinAnchor() {
        return this.flipped ?
            (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Top :
            (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Left;
    }
}
