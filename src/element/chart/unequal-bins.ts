import { Anchor, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { ParsedData } from "../plot";
import { BaseChart, BaseChartOption } from "./base-chart";

interface SizeDef { x: number; y: number; width: number; height: number; }

export interface UnequalBinsOption extends BaseChartOption {
    pivot: number;
    bins: number[];
}

export class UnequalBins extends BaseChart<UnequalBinsOption> {
    public render = template`
        Component {
            xScale = getScale(true) || createXScale()
            yScale = getScale(true) || createYScale()

            @for (d, index) in data.values {
                Component {
                    @let z = _cachedSize[index]

                    key = index
                    anchor = getRectAnchor()
                    x = z.x; y = z.y; width = z.width; height = z.height;

                    @yield children with d default {
                        Rect.full {
                            @props prop.opt.bar
                        }
                    }
                }
            }

            @for (d, index) in data.values {
                Component {
                    @let z = _cachedSize[index]

                    key = "o" + index
                    anchor = getRectAnchor()
                    x = z.x; y = z.y; width = z.width; height = z.height;

                    @yield overlay with d
                }
            }
        }
    `;

    public data!: ParsedData;

    private _cachedSize: SizeDef[] = [];
    private _cacheSize() {
        const minValues: number[] = [];
        const maxValues: number[] = [];
        this.data.values.forEach((d: any, index: number) => {
            const height = (d.value - d.minValue) / (this.prop.bins[index + 1] - this.prop.bins[index]);
            minValues.push(d.minValue);
            maxValues.push(height + d.minValue);
        });
        this.getScale(this.flipped).domain([Math.min(...minValues), Math.max(...maxValues)]);

        this.data.values.forEach((d, index) => {
            const x = this.getX(d.pos);
            const y = this.getY(d.minValue);
            const width = this.getX(this.prop.bins[index + 1]) - this.getX(this.prop.bins[index]);
            const height = Math.abs(this.getHeight((d.value - d.minValue) / (this.prop.bins[index + 1] - this.prop.bins[index]), this.getY(d.minValue)));
            this._cachedSize[index] = {
                x: this.flipped ? y : x,
                y: this.flipped ? x : y,
                width: this.flipped ? height : width,
                height: this.flipped ? width : height,
            };
        });
    }

    public willRender() {
        super.willRender();
        this._cacheSize();
    }

    // @ts-ignore
    protected getRectAnchor() {
        return this.flipped ?
            (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Top :
            (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Left;
    }

    // @ts-ignore
    private getYStartPos() {
        return this.inverted ? 0 : GeometryValue.fullSize;
    }

}
