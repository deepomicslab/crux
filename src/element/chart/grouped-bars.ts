import { ColorSchemeCategory, schemeCategory } from "../../color";
import { Anchor } from "../../defs/geometry";
import { template as t } from "../../template/tag";
import { XYPlot } from "../plot";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface GroupedBarsOption extends BaseChartOption {
    barWidth: number;
}

export class GroupedBars extends BaseChart<GroupedBarsOption> {
    public render = t`
    Component {
        @let fk = prop.data[0]
        @let gWidth = getWidth()
        @let width = gWidth * 1.0 / prop.data.length
        @let y = getY(0)

        @for (group, pos) in data {
            Component {
                @let tX = 0
                @let gX = getX(group[fk].pos)

                key = pos
                anchor = @anchor("center", "top")
                x = flipped ? 0 : gX
                y = flipped ? gX : 0
                width = flipped ? @geo(100, 0) : gWidth
                height = flipped ? gWidth : @geo(100, 0)

                @yield group with group

                @for key in prop.data {
                    @let d = group[key]
                    Component {
                        @let x = tX
                        @let height = getHeight(d.value - d.minValue, d.minValue)
                        @expr tX += width

                        key = key
                        x = flipped ? y : x
                        anchor = getAnchor()
                        y = flipped ? x : y
                        width = flipped ? height : width
                        height = flipped ? width : height

                        @let dd = { data: d, key: key, scheme: _scheme }
                        @yield children with dd default {
                            Rect.full {
                                fill = _scheme.get(key)
                                @props prop.opt.bar
                            }
                        }
                    }
                }
            }
        }
    }
    `;

    // @ts-ignore
    private _scheme!: ColorSchemeCategory<any>;

    protected getAnchor() {
        return this.flipped ?
            (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Top :
            (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Left;
    }

    protected inheritData() {
        if (!(this.$parent instanceof XYPlot) || !this.$parent.hasMultipleData)
            throw new Error(`GroupedBars: it must be placed in an XYPlot with multiple data groups.`);
        if (!Array.isArray(this.prop.data))
            throw new Error(`GroupedBars: the data prop must be an array of data keys.`);
        const $p = this.$parent;
        const data = {};
        this.prop.data.forEach(key => {
            $p.data[key].values.forEach((d: any) => {
                const pos = d.pos;
                if (!data[pos]) data[pos] = {};
                data[pos][key] = d;
            });
        });
        this.data = data;
        this._scheme = schemeCategory(this.$v.theme, this.prop.data);
    }
}
