import { XYPlot } from "../../plot/xy-plot";
import { BaseChart } from "../base-chart";

export interface StackedChart {
    data: Record<string, any>;
    dataKeys: string[];
    dataPos: any[];
}

export function inheritData(this: BaseChart & StackedChart) {
    if (!(this.$parent instanceof XYPlot) || !this.$parent.hasMultipleData)
        throw new Error(`StackedBars: it must be placed in an XYPlot with multiple data groups.`);
    if (typeof this.prop.data !== "string")
        throw new Error(`StackedBars: the data prop must be a stacked data key.`);
    const $p = this.$parent;
    const data = {};
    this.dataKeys = $p.stackedDataKeys(this.prop.data);
    this.dataPos = $p.data[this.dataKeys[0]].values.map(d => d.pos);
    this.dataKeys.forEach(key => {
        $p.data[key].values.forEach(d => {
            const pos = d.pos;
            if (!data[pos]) data[pos] = {};
            data[pos][key] = d;
        });
    });
    Object.keys(data).forEach(pos => {
        let acc = 0;
        this.dataKeys.forEach(key => {
            const value = data[pos][key].value;
            data[pos][key].minValue = acc;
            acc += value;
        });
    });
    this.data = data;
}
