import { Anchor, GeometryValue } from "../../defs/geometry";
import { useTemplate } from "../../ext/decorator";
import { ParsedData } from "../plot";
import { BaseChart, BaseChartOption } from "./base-chart";

interface SizeDef {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface BarsOption extends BaseChartOption {
    pivot: number;
}

@useTemplate(`
    Component {
        xScale = getScale(true) || createXScale()
        yScale = getScale(false) || createYScale()

        @for (d, index) in data.values {
            Component {
                @let z = _cachedSize[index]

                key = index
                anchor = getRectAnchor(d, prop.pivot)
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
                anchor = getRectAnchor(d, prop.pivot)
                x = z.x; y = z.y; width = z.width; height = z.height;

                @yield overlay with d
            }
        }
    }
`)
export class Bars extends BaseChart<BarsOption> {
    public data!: ParsedData;

    private _cachedSize: SizeDef[] = [];
    private _cacheSize() {
        this.data.values.forEach((d, index) => {
            const x = this.getX(d.pos);
            const y = this.getY(d.minValue);
            const width = this.getWidth();
            const height = Math.abs(this.getHeight(d.value - d.minValue, d.minValue));
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
    private getRectAnchor(d: any, pivot: number) {
        const belowPivot = typeof pivot === "number" && d.value < d.minValue && d.value < pivot;
        return this.flipped
            ? (this.inverted !== belowPivot ? Anchor.Left : Anchor.Right) | Anchor.Middle
            : (this.inverted !== belowPivot ? Anchor.Top : Anchor.Bottom) | Anchor.Center;
    }

    // @ts-ignore
    private getYStartPos() {
        return this.inverted ? 0 : GeometryValue.fullSize;
    }
}
