import { Anchor, GeometryUnit, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { XYPlot } from "../plot";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface StackedBarsOption extends BaseChartOption {
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
                    @let y = getYPos(tSize)
                    @let width = getWidth()
                    @let height = getHeight(d.value, tValue)
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

    private getYPos(offset: number) {
        return this.inverted ? offset : GeometryValue.create(100, GeometryUnit.Percent, -offset);
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
            $p.data[key].values.forEach(d => {
                const pos = d.pos;
                if (!data[pos]) data[pos] = {};
                data[pos][key] = d;
            });
        });
        this.data = data;
    }
}
