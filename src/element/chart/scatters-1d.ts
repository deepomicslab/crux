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
                    @let y = getY(d2.value)
                    Component {
                        key = "s" + pos + "p" + index
                        @props dotOpts(x, y, d2.offset)
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

    public willRender() {
        super.willRender();
        if (this.layerNotSet) {
            this.resetLayer();
            if (Array.isArray(this.data.values)) {
                this.data.values.forEach(d1 => {
                    const result = this.getValues(d1).map((d2: number) => ({
                        value: d2,
                        offset: this.setLayer(this.getY(d2), d1.pos),
                    }));
                    this.setValues(d1, result);
                });
            } else {
                Object.keys(this.data.values).forEach(k => {
                    const d1 = this.data.values[k];
                    const result = this.getValues(d1).map((d2: number) => ({
                        value: d2,
                        offset: this.setLayer(this.getY(d2), d1.pos),
                    }));
                    this.setValues(d1, result);
                });
            }
        }
    }

    private resetLayer() {
        this._layer = {};
        this._layers = [new Set()];
    }

    get layerNotSet() {
        if (Array.isArray(this.data.values)) {
            const arr = this.getValues(this.data.values[0]);
            if (Object.keys(arr[0]).indexOf("offset") >= 0)
                return false;
        } else {
            const k0 = Object.keys(this.data.values)[0];
            const arr = this.getValues(this.data.values[k0]);
            if (Object.keys(arr[0]).indexOf("offset") >= 0)
                return false;
        }
        return true;
    }

    private _layer: any = {};
    private _layers: Set<string>[] = [new Set()];

    public getDistance(c1: number[], c2: number[]): number {
        return Math.sqrt((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2);
    }

    // @ts-ignore
    private getValues(d: any) {
        if (Array.isArray(d.data)) return d.data;
        else if ("values" in d.data) return d.data.values;
        throw new Error(`Scatters1D: Unknown data format.`);
    }

    private setValues(d: any, values: any[]) {
        if (Array.isArray(d.data))
            d.data = values;
        else if ("values" in d.data)
            d.data.values = values;
        else
            throw new Error(`Scatters1D: Unknown data format.`);
    }

    private setLayer(y: number, pos: number) {
        const r = this.prop.r;
        const fy = Math.round(y);
        if (!this._layer[pos]) this._layer[pos] = 0;
        // layout
        let placedLayer: number | null = null;
        for (let l = 0; l <= this._layer[pos]; l++) {
            let occupied = false;
            for (let i = Math.max(fy - r, 0); i <= fy + r; i++) {
                if (this._layers[l].has(`${i}-${pos}`)) {
                    occupied = true; break;
                }
            }
            if (!occupied) {
                this._layers[l].add(`${fy}-${pos}`);
                placedLayer = l;
                break;
            }
        }
        if (placedLayer === null) {
            this._layer[pos]++;
            placedLayer = this._layer[pos];
            // @ts-ignore
            this._layers[placedLayer] = new Set([fy]);
        }
        // @ts-ignore
        return ((Math.floor((placedLayer - 1) / 2) + 1) * 2 * r) * (placedLayer % 2 ? 1 : -1);
    }

    // @ts-ignore
    private dotOpts(x: number, y: number, offset: number) {
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
