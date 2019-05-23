import { oneLineTrim } from "common-tags";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { parseData, XYPlot, XYPlotDataAcceptable } from "../plot";

export interface BaseChartOption extends ComponentOption, XYPlotDataAcceptable {
    data: any[];
}

export class BaseChart<Option extends BaseChartOption = BaseChartOption> extends Component<Option> {
    protected data: any[] | Record<string, any>;
    protected columnWidth: number;

    protected flipped = false;
    protected inverted = false;

    public willRender() {
        const dataProp = this.prop.data;
        if (this.$parent instanceof XYPlot) {
            this.inheritData();
            this.columnWidth = this.$parent.columnWidth;
            this.flipped = this.$parent.flipped;
            this.inverted = this.$parent.inverted;
        } else if (Array.isArray(dataProp)) {
            this.data = parseData(this as any, dataProp);
        } else {
            throw new Error(`Chart: please supply data.`);
        }
    }

    protected inheritData() {
        const dataProp = this.prop.data;
        const $p = this.$parent as XYPlot;
        if ($p.hasMultipleData) {
            const getData = k => {
                if (!(k in (this.$parent as any).data)) {
                    throw new Error(`${k} doesn't exist in the plot.`);
                }
                return (this.$parent as any).data[k];
            };
            if (typeof dataProp === "string") {
                this.data = getData(dataProp);
            } else if (Array.isArray(dataProp)) {
                this.data = {};
                dataProp.forEach(p => this.data[p] = getData(p));
            } else {
                throw new Error(oneLineTrim`Chart: a data key or an array of data keys
                 must be used when supplying multiple data to the plot.`);
            }
        } else {
            this.data = $p.data as any[];
        }
    }

    protected propValue(name: string, d: any, i: number, g: any[]): any {
        const val = this.prop[name];
        return typeof val === "function" ? val.call(null, d, i, g) : val;
    }
}
