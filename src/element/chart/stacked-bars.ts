import { GeometryUnit, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";
import { inheritData, StackedChart } from "./utils/stacked";

export interface StackedBarsOption extends BaseChartOption {
}

export class StackedBars extends BaseChart<StackedBarsOption> implements StackedChart {
    public render = template`
    Component {
        @for (group, pos) in data {
            @for key in dataKeys {
                @let d = group[key]
                Component {
                    key = pos + key
                    anchor = getAnchor()
                    @props barOpts(d)

                    @let dd = { data: d, key: key }
                    @yield children with dd
                }
            }
        }
    }
    `;

    public data!: Record<string, any>;
    public dataKeys!: string[];
    public dataPos!: any[];

    // @ts-ignore
    private getYPos(offset: number) {
        return this.inverted ? offset : GeometryValue.create(100, GeometryUnit.Percent, -offset);
    }

    // @ts-ignore
    private barOpts(d) {
        return this.flippedOpts({
            x: this.getX(d.pos),
            y: this.getY(d.minValue),
            width: this.getWidth(),
            height: this.getHeight(d.value, d.minValue),
        });
    }

    protected inheritData() {
        inheritData.call(this);
    }
}
