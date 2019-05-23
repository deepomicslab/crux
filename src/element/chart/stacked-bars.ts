import { Anchor, GeometryUnit, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { XYPlot } from "../plot";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface StackedBarsOption extends BaseChartOption {
    barWidth: number;
}

export class StackedBars extends BaseChart<StackedBarsOption> {
    protected data: Record<string, any>;
    private dataKeys: string[];

    public render = template`
    Component {
        @for (group, pos) in data {
            @let tValue = 0
            @let tSize = 0
            @for key in dataKeys {
                @let d = group[key]
                Component {
                    @let x = getX(d.pos)
                    @let y = getY(tSize)
                    @let width = getWidth()
                    @let height = getHeight(tValue, d.value)
                    @expr tSize += height
                    @expr tValue += d.value

                    key = pos + key
                    anchor = getAnchor()
                    x = flipped ? y : x
                    y = flipped ? x : y
                    width = flipped ? height : width
                    height = flipped ? width : height

                    @let dd = { data: d, key: key }
                    @yield children with dd
                }
            }
        }
    }
    `;

    private getAnchor() {
        return this.flipped ?
            (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Middle :
            (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Center;
    }

    private getX(pos: any) {
        return this._scale(pos, !this.flipped);
    }

    private getY(offset: number) {
        return this.inverted ? offset : GeometryValue.create(100, GeometryUnit.Percent, -offset);
    }

    private getWidth() {
        return this.prop.barWidth || this.columnWidth;
    }

    private getHeight(accumulated: number, value: number) {
        const h = this._scale(accumulated + value, this.flipped) - this._scale(accumulated, this.flipped);
        return this.inverted ? h : -h;
    }

    protected inheritData() {
        if (!(this.$parent instanceof XYPlot) || !this.$parent.hasMultipleData)
            throw new Error(`StackedBars: it must be placed in an XYPlot with multiple data groups.`);
        if (typeof this.prop.data !== "string")
            throw new Error(`StackedBars: the data prop must be a stacked data key.`);
        const $p = this.$parent;
        const data = {};
        this.dataKeys = $p.stackedDataKeys(this.prop.data);
        this.dataKeys.forEach(key => {
            $p.data[key].forEach(d => {
                const pos = d.pos;
                if (!data[pos]) data[pos] = {};
                data[pos][key] = d;
            });
        });
        this.data = data;
    }
}
