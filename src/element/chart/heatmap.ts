import { Anchor, GeometryUnit, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface HeatMapOption extends BaseChartOption {
    colorMap: string | Record<number, string>;
}

export class HeatMap extends BaseChart<HeatMapOption> implements HeatMap {
    public render = template`
    Component {
        xScale = getScale(true) || createXScale()
        yScale = getScale(false) || createYScale()

        @let xnum = data.raw.length
        @let ynum = data.raw[0].length

        @let min = getMatMin(data.raw)
        @let max = getMatMax(data.raw)

        @let xOffset = Math.abs(getX(1) - getX(0))
        @let yOffset = Math.abs(getY(1) - getY(0))

        @for (arr, index1) in data.raw {
            @for (d, index2) in arr {
                Component {
                    key = index1 + "-" + index2
                    anchor = getAnchor()
                    x = getX(index1); y = getY(index2); width = xOffset; height = yOffset

                    @yield children with d default {
                        Rect.full {
                            fill = getColor(d, min, max, prop.colorMap)
                            stroke = "#fff"
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
            colorMap: "jet",
        };
    }

    private getHeatMapAnchor() {
        return this.$behavior.flipped ?
            (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Top :
            (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Left;
    }

    private getMatMax(data) {
        return this._getArrayMax(data.map(this._getArrayMax));
    }

    private getMatMin(data) {
        return this._getArrayMin(data.map(this._getArrayMin));
    }

    private getColor(d: number, min: number, max: number, colorMap: any) {
        if (colorMap === "jet") {
            const _ = this._getJetColor(d, min, max);
            return `rgb(${_["r"]},${_["g"]},${_["b"]})`;
        } else if (colorMap === "grey") {
            const _ = this._getGreyColor(d, min, max);
            return `rgb(${_}, ${_}, ${_})`;
        } else {
            return colorMap[d];
        }
    }

    private _getArrayMax(a: any[]) { return a.reduce((a, b) => Math.max(a, b)); }
    private _getArrayMin(a: any[]) { return a.reduce((a, b) => Math.min(a, b)); }

    private _getJetColor(d: number, min: number, max: number) {
        let r = 255, g = 255, b = 255;
        d = d >= min ? d : min;
        d = d <= max ? d : max;
        const nd = (d - min) / (max - min);

        const c1 = 0.1242,
              c2 = 0.3747,
              c3 = 0.5040,
              c4 = 0.6253,
              c5 = 0.8758;
        let nr, ng, nb;

        if (nd < c1) {
            nb = c3 + ((1. - c3) / c1) * nd;
            ng = nr = 0.;
        } else if (nd < c2) {
            nb = 1.;
            nr = 0.;
            ng = (nd - c1) * (1. / (c2 - c1));
        } else if (nd < c4) {
            nb = (c4 - nd) * (1. / (c4 - c2));
            ng = 1.;
            nr = (nd - c2) * (1. / (c4 - c2));
        } else if (nd < c5) {
            nb = 0.;
            nr = 1.;
            ng = (c5 - nd) * (1. / (c5 - c4));
        } else {
            nb = ng = 0.;
            nr = 1. - (nd - c5) * ((1. - c3) / (1. - c5));
        }
        r = 255 * nr; g = 255 * ng; b = 255 * nb;
        return {
            "r": r,
            "g": g,
            "b": b,
        };
    }

    private _getGreyColor(d: number, min: number, max: number) {
        const _ = this._getJetColor(d, min, max);
        return 0.2989 * _["r"] + 0.5870 * _["g"] + 0.1140 * _["b"];
    }
}
