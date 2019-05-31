import { GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface BarsOption extends BaseChartOption {
}

export class Bars extends BaseChart<BarsOption> {
    public render = template`
        Component {
            xScale = getScale(true) || createXScale()
            yScale = getScale(false) || createYScale()

            @for (d, index) in data.values {
                Component {
                    @let z = _cachedSize[index]

                    key = index
                    anchor = getAnchor()
                    x = z.x; y = z.y; width = z.width; height = z.height;

                    @yield children with d default {
                        Rect.full {}
                    }
                }
            }

            @for (d, index) in data.values {
                Component {
                    @let z = _cachedSize[index]

                    key = "o" + index
                    anchor = getAnchor()
                    x = z.x; y = z.y; width = z.width; height = z.height;

                    @yield overlay with d
                }
            }
        }
    `;

    private _cachedSize = [];
    private _cacheSize() {
        this.data.values.forEach((d, index) => {
            const x = this.getX(d.pos);
            const y = this.getY(d.minValue);
            const width = this.getWidth();
            const height = this.getHeight(d.value - d.minValue, d.minValue);
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

    private getYStartPos() {
        return this.inverted ? 0 : GeometryValue.fullSize;
    }
}
