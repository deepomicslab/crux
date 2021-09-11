import * as d3 from "d3-shape";

import { Statistics } from "../../algo";
import { Anchor, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

interface ViolinData {
    bins: { x1: number; x2: number; y: number }[];
    maxY: number;
    stat: Statistics;
}

export interface ViolinsOption extends BaseChartOption {
    dataLine: boolean;
    quartile: boolean;
    extremeLine: boolean;
    /**
     * for non-grouped violins: one color for all or one color for each violin.
     * for grouped violins: one color for each hue (totally two colors).
     */
    fill: string | string[];
    /**
     * "one": each violin has the same max width
     * "hue": violins from the same hue are scaled together
     * "cat": violins from the same category are scaled together
     * "all": all violins are scaled together
     */
    equalMaxCount: string;
    /**
     * limit the violin range within the range of the observed data
     */
    cut: boolean;

    // options applying only to non-grouped violins
    /**
     * setting half to "left" to draw only the left half of violin
     */
    half: string;

    // options applying only to grouped violins
    /**
     * setting split to True will draw half of a violin
     */
    split: boolean;

    // styling options
    quartileLineOptions: any;
    meanPointOptions: any;
    violinOptions: any;
    extremeLineOptions: any;
}

export class Violins extends BaseChart<ViolinsOption> {
    public render = template`
    Component {
        @let prepData = prep()
        @for (arr, pos) in prepData {
            @for (d, i) in arr {
                Component {
                    key = pos * 10 + i
                    anchor = getAnchor()
                    @props containerOpts(pos)
                    @let pathData = d.path
                    Component {
                        anchor = getViolinAnchor()
                        // violin
                        Path {
                            @props prop.opt.violin
                            d = pathData
                            stroke = "#aaa"
                            fill = d.fill ? d.fill : "none"
                            @props prop.violinOptions
                        }
                        // extreme value line
                        @if prop.extremeLine && d.stat {
                            Line {
                                @props extremeValueLine(d.stat, d.centerPos, d.trans)
                                fill = "grey"
                                @props prop.extremeLineOptions
                            }
                        }
                        // quartile
                        @if prop.quartile && d.stat {
                            Line {
                                @props quartileOpts(d.stat, d.centerPos, d.trans)
                                strokeWidth = "5px"
                                @props prop.quartileLineOptions
                            }
                            Circle.centered {
                                @props medianCircleOpts(d.stat, d.centerPos, d.trans)
                                r = 3
                                fill = "white"
                                stroke = "black"
                                @props prop.meanPointOptions
                            }
                        }
                    }
                }
            }
        }
    }
    `;

    private _halfWidth!: number;

    public defaultProp() {
        return {
            ...super.defaultProp(),
            dataLine: false,
            quartile: true,
            half: null,
            equalMaxCount: "all",
            position: null,
            fill: null,
            cut: false,
            split: false,
            extremeLine: true,
        };
    }

    // @ts-ignore
    private quartileOpts(stat: Statistics, centerPos: number, trans: number) {
        return this.flippedOpts({
            y1: this.getScale(this.flipped)(stat.Q1()),
            y2: this.getScale(this.flipped)(stat.Q3()),
            x1: centerPos + trans * 3,
            x2: centerPos + trans * 3,
        });
    }

    // @ts-ignore
    private extremeValueLine(stat: Statistics, centerPos: number, trans: number) {
        return this.flippedOpts({
            y1: this.getScale(this.flipped)(stat.max()),
            y2: this.getScale(this.flipped)(stat.min()),
            x1: centerPos + trans,
            x2: centerPos + trans,
        });
    }

    // @ts-ignore
    private medianCircleOpts(stat: Statistics, centerPos: number, trans: number) {
        return this.flippedOpts({
            x: centerPos + trans * 3,
            y: this.getScale(this.flipped)(stat.median()),
        });
    }

    // @ts-ignore
    private prep() {
        const useHue = Array.isArray(this.data.raw.violins[0]);
        const max = this.getMax(useHue);
        let toReturn: { path: string; fill: string; quartiles: [number, number, number] };
        this.updateScale(useHue);
        if (useHue) {
            this._halfWidth = this.columnWidth / 4;
            toReturn = this.data.raw.violins.map((arr: ViolinData[], i: number) => {
                return arr.map((d, j) => {
                    if (d.bins.length === 0) {
                        return { path: "", stat: null };
                    } else {
                        let height;
                        switch (this.prop.equalMaxCount) {
                            case "one":
                                height = d.maxY;
                                break;
                            case "hue":
                                height = max[j];
                                break;
                            case "cat":
                                height = Math.max(...arr.map(d => d.maxY));
                                break;
                            default:
                                height = Math.max(max[0], max[1]);
                        }
                        const centerPos = this.prop.split
                            ? this.columnWidth / 2
                            : j === 0
                            ? this.columnWidth / 4
                            : (this.columnWidth * 3) / 4;
                        const cachedPoints = this.getCachedPoints(d.bins, centerPos, height, d.stat);
                        const path = this.prop.split
                            ? this.getPath(cachedPoints[j])
                            : this.getPath(cachedPoints[0]).concat(this.getPath(cachedPoints[1]));
                        // const path = this.getPath(cachedPoints[0])
                        return {
                            path,
                            centerPos,
                            fill: this.prop.fill ? this.prop.fill[j] : "none",
                            stat: d.stat,
                            trans: this.prop.split ? (j === 0 ? -1 : 1) : 0,
                        };
                    }
                });
            });
        } else {
            this._halfWidth = this.columnWidth / 2;
            toReturn = this.data.raw.violins.map((d: ViolinData, i: number) => {
                const height = this.prop.equalMaxCount === "one" ? d.maxY : max[0];
                const centerPos = this.columnWidth / 2;
                const cachedPoints = this.getCachedPoints(d.bins, centerPos, height, d.stat);
                const path = !false
                    ? this.getPath(cachedPoints[0]).concat(this.getPath(cachedPoints[1]))
                    : this.getPath(cachedPoints[this.prop.half === "left" ? 0 : 1]);
                return [
                    {
                        path,
                        centerPos,
                        fill: this.prop.fill
                            ? Array.isArray(this.prop.fill)
                                ? this.prop.fill[i]
                                : this.prop.fill
                            : "none",
                        stat: d.stat,
                        trans: this.prop.half ? (this.prop.half === "left" ? -1 : 1) : 0,
                    },
                ];
            });
        }
        return toReturn;
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

    protected getViolinAnchor() {
        return this.flipped
            ? (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Top
            : (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Left;
    }

    protected getCachedPoints(
        histoBins: { x1: number; x2: number; y: number }[],
        centerPos: number,
        height: number,
        stat: Statistics,
    ) {
        // transform bins to points for line
        let s: { x1: number; x2: number; y: number }[];
        let e: { x1: number; x2: number; y: number }[];
        if (this.prop.cut) {
            s = [
                { x1: stat.min(), x2: stat.min(), y: 0 },
                { x1: stat.min(), x2: stat.min(), y: histoBins[0].y },
            ];
            e = [
                { x1: stat.max(), x2: stat.max(), y: histoBins[histoBins.length - 1].y },
                { x1: stat.max(), x2: stat.max(), y: 0 },
            ];
            if (histoBins[0][0] <= stat.min()) histoBins = histoBins.slice(1);
            if (histoBins[histoBins.length - 1][0] >= stat.max()) histoBins.pop();
        } else {
            s = [
                {
                    x1: histoBins[0].x1 - (histoBins[0].x2 - histoBins[0].x1) / 2,
                    x2: histoBins[0].x1 - (histoBins[0].x2 - histoBins[0].x1) / 2,
                    y: 0,
                },
            ];
            e = [
                {
                    x1:
                        histoBins[histoBins.length - 1].x2 +
                        (histoBins[histoBins.length - 1].x2 - histoBins[histoBins.length - 1].x1) / 2,
                    x2:
                        histoBins[histoBins.length - 1].x2 +
                        (histoBins[histoBins.length - 1].x2 - histoBins[histoBins.length - 1].x1) / 2,
                    y: 0,
                },
            ];
        }
        histoBins = s.concat(histoBins).concat(e);
        const lPoints: [number, number][] = [];
        const rPoints: [number, number][] = [];
        histoBins.forEach(bin => {
            const xl = centerPos + (-bin.y / height) * this._halfWidth;
            const xr = centerPos + (bin.y / height) * this._halfWidth;
            const y = this.getScale(this.flipped)((bin.x1 + bin.x2) / 2);
            lPoints.push(this.flipped ? [y, xl] : [xl, y]);
            rPoints.push(this.flipped ? [y, xr] : [xr, y]);
        });
        rPoints.reverse();
        return [lPoints, rPoints];
    }

    protected getPath(cachedPoints: [number, number][]) {
        let path: string;
        const lineG: d3.Line<[number, number]> = d3.line().curve(d3.curveCatmullRom.alpha(0.5));
        if (this.prop.cut) {
            console.log(cachedPoints);
            const curvePoints = cachedPoints.slice(1, cachedPoints.length - 1);
            path = `M${cachedPoints[0][0]}, ${cachedPoints[0][1]}
                    L${curvePoints[0][0]}, ${curvePoints[0][1]}`
                .concat(lineG(curvePoints)!.replace("M", "L"))
                .concat(`L${curvePoints[curvePoints.length - 1][0]}, ${curvePoints[curvePoints.length - 1][1]}`)
                .concat(`L${cachedPoints[cachedPoints.length - 1][0]}, ${cachedPoints[cachedPoints.length - 1][1]}`);
        } else {
            path = lineG(cachedPoints)!;
        }
        return path;
    }

    protected getMax(useHue: boolean) {
        if (useHue) {
            return [0, 1].map((_: number, i: number) =>
                Math.max(...this.data.raw.violins.map((arr: ViolinData[]) => arr[i].maxY)),
            );
        } else {
            return [Math.max(...this.data.raw.violins.map((d: ViolinData) => d.maxY))];
        }
    }

    protected updateScale(useHue: boolean) {
        const orgMin = Math.min(...(this.data.values as { minValue: number }[]).map(d => d.minValue));
        const orgMax = Math.max(...(this.data.values as { value: number }[]).map(d => d.value));
        const scale = this.getScale(this.flipped);
        if (scale.domain()[0] === orgMin && scale.domain()[1] === orgMax) {
            if (useHue) {
                const violinData: { x1: number; x2: number; y: number }[][] = [];
                this.data.raw.violins.forEach((arr: ViolinData[]) =>
                    arr.forEach(d => {
                        if (d.bins.length !== 0) violinData.push(d.bins);
                    }),
                );
                const min = Math.min(...violinData.map(d => d[0].x1 - (d[0].x2 - d[0].x1) / 2));
                const max = Math.max(
                    ...violinData.map(d => d[d.length - 1].x2 + (d[d.length - 1].x2 - d[d.length - 1].x1) / 2),
                );
                scale.domain([min, max]);
            } else {
                const min = Math.min(
                    ...this.data.raw.violins.map((d: ViolinData) => d.bins[0].x1 - (d.bins[0].x2 - d.bins[0].x1) / 2),
                );
                const max = Math.max(
                    ...this.data.raw.violins.map(
                        (d: ViolinData) =>
                            d.bins[d.bins.length - 1].x2 +
                            (d.bins[d.bins.length - 1].x2 - d.bins[d.bins.length - 1].x1) / 2,
                    ),
                );
                scale.domain([min, max]);
            }
        }
    }
}
