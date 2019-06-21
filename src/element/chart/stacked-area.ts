import { template } from "../../template/tag";
import { BaseChart, BaseChartOption } from "./base-chart";
import { inheritData, StackedChart } from "./utils/stacked";

export interface StackedAreaOption extends BaseChartOption {

}

export class StackedArea extends BaseChart<StackedAreaOption> implements StackedChart {
    public render = template`
    Component {
        @for key in dataKeys {
            Component {
                key = key
                @let path = getPath(key)
                @let d = { path: path, key: key }
                @yield children with d default {
                    Path { d = path; fill = "#aaa" }
                }
            }
        }
    }
    `;

    public data!: Record<string, any>;
    public dataKeys!: string[];
    public dataPos!: any[];

    // @ts-ignore
    private getPath(key: string) {
        const data = this.dataPos.map((p, i) => {
            const d = this.data[p][key];
            return [
                this._scale(d.pos, true),
                this._scale(d.value + d.minValue, false),
                this._scale(d.minValue, false),
            ] as [number, number, number];
        });

        // generate path
        let path = `M${data[0][0]},${data[0][2]} `;
        for (const d of data) {
            path += `L${d[0]},${d[1]} `;
        }
        data.reverse();
        for (const d of data) {
            path += `L${d[0]},${d[2]} `;
        }
        path += `z`;
        return path;
    }

    protected inheritData() {
        inheritData.call(this);
    }
}
