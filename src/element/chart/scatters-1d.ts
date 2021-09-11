import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface Scatters1DOption extends BaseChartOption {
    r: number;
    fill: string;
    stroke: string;
    dotOptions: any;
}

export class Scatters1D extends BaseChart<Scatters1DOption> {
    public render = template`
    Component {
        @for (d1, pos) in data.values {
            @let x = getX(d1.pos)
            @let values = getValues(d1)
            Component {
                key = pos
                @for (d2, index) in values {
                    @let y = getY(d2)
                    Component {
                        key = "s" + pos + "p" + index
                        @props dotOpts(x, y)
                        @yield children with { pos, index } default {
                            Circle.centered {
                                r = prop.r
                                fill = prop.fill
                                stroke = prop.stroke
                                @props prop.dotOptions
                            }
                        }
                    }
                }
            }
        }
    }
    `;

    private _layer = 0;
    private _layers: Set<number>[] = [new Set()];

    public getDistance(c1: number[], c2: number[]): number {
        return Math.sqrt((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2);
    }

    // @ts-ignore
    private getValues(d: any) {
        if (Array.isArray(d.data)) return d.data;
        else if ("values" in d.data) return d.data.values;
        throw new Error(`Scatters1D: Unknown data format.`);
    }

    // @ts-ignore
    private dotOpts(x: number, y: number) {
        const r = this.prop.r;
        const fy = Math.round(y);
        // layout
        let placedLayer: number | null = null;
        for (let l = 0; l <= this._layer; l++) {
            let occupied = false;
            for (let i = Math.max(fy - r, 0); i <= fy + r; i++) {
                if (this._layers[l].has(i)) {
                    occupied = true; break;
                }
            }
            if (!occupied) {
                this._layers[l].add(fy);
                placedLayer = l;
                break;
            }
        }
        if (placedLayer === null) {
            this._layer++;
            placedLayer = this._layer;
            this._layers[placedLayer] = new Set([fy]);
        }
        const offset = ((Math.floor((placedLayer - 1) / 2) + 1) * 2 * r) * (placedLayer % 2 ? 1 : -1);
        return this.flippedOpts({ x: x + offset, y });
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            r: 2,
            fill: "#aaa",
        };
    }
}
