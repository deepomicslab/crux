import d3 = require("d3-array");
import _ = require("lodash");

import { GeometryValue, offset } from "../../defs/geometry";
import { ElementDef } from "../../rendering/render-tree";
import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface XYPlotPoint {
    pos: number;
    value: number;
    minValue: number;
    data?: any;
}

export interface ParsedData {
    values: XYPlotPoint[];
    raw: any;
}

interface DataHandler {
    values: (d: any) => any[];
    min: (d: any, i: number) => number;
    max: (d: any, i: number) => number;
    pos: (d: any, i: number) => any;
}

export interface XYPlotOption extends ComponentOption {
    data: any[] | Record<string, any>;
    dataHandler: { [name: string]: DataHandler };
    stackedData: Record<string, string[]>;
    categoryRange: any[];
    valueRange: [number, number];
    capToMinValue: boolean;
    gap: number;
    hasPadding: boolean;
    // layout
    flip: boolean;
    invertValueAxis: boolean;
    // padding
    padding: number;
    "padding-x": number;
    "padding-y": number;
    "padding-l": number;
    "padding-r": number;
    "padding-t": number;
    "padding-b": number;
}

export class XYPlot extends Component<XYPlotOption> {
    public render = template`
    Component {
        Component {
            @let p = _paddings

            x = p[3]
            y = p[0]
            width = @geo(100, -p[1]-p[3])
            height = @geo(100, -p[0]-p[2])
            xScale = _xScale
            yScale = _yScale

            @yield children then handleChildren
        }
    }
    `;

    public data: ParsedData | Record<string, ParsedData>;
    public hasMultipleData = false;
    public columnWidth: number;

    private _paddings: [number, number, number, number];
    private _xScale: any;
    private _yScale: any;
    private _cRange: any[];
    private _vRange: [number, number];

    public defaultProp() {
        return {
            ...super.defaultProp(),
            hasPadding: true,
        };
    }

    public willRender() {
        const data = this.prop.data;
        const handler = this.prop.dataHandler || {};
        if (data) {
            let allData: XYPlotPoint[];
            if (Array.isArray(data)) {
                this.data = parseData(this, data, handler.default);
                allData = this.data.values;
            } else if (typeof data === "object") {
                this.hasMultipleData = true;
                this.data = {};
                Object.keys(data).forEach(k =>
                    this.data[k] = parseData(this, data[k], handler[k] || handler.default));
                // all data
                allData = [];
                const keys = new Set(Object.keys(this.data));
                const stackedData = this.prop.stackedData;
                if (typeof stackedData === "object") {
                    Object.keys(stackedData).forEach(k => {
                        if (typeof k !== "string" || !(k in stackedData))
                            throw new Error(`${k} is not a valid data key.`);
                        const flatten: XYPlotPoint[] = stackedData[k].map(sd => {
                            keys.delete(sd);
                            return this.data[sd].values;
                        }).flat();
                        const grouped = _.groupBy(flatten, "pos");
                        const gather = pos => grouped[pos].reduce((p, c) => ({ pos: p.pos, value: p.value + c.value, minValue: 0 }));
                        allData.push(...Object.keys(grouped).map(gather));
                    });
                }
                for (const e of keys.entries()) {
                    allData.push(...this.data[e[0]].values);
                }
            } else {
                throw new Error(`XYPlot: data supplied must be an array or an object.`);
            }
            this._cRange = this.prop.categoryRange || d3.extent(allData, d => d.pos);
            this._vRange = this.prop.valueRange || [
                this.prop.capToMinValue ? d3.min(allData, d => d.minValue) : 0,
                d3.max(allData, d => d.value),
            ];
        }
        this._paddings = this.getPadding();
        this._xScale = this.createScale(true);
        this._yScale = this.createScale(false);
    }

    public handleChildren(children: ElementDef[]) {
        children.forEach(c => {
            c.opt.props.width = GeometryValue.fullSize;
            c.opt.props.height = GeometryValue.fullSize;
        });
        return children;
    }

    // API

    public get flipped() { return !!this.prop.flip; }
    public get inverted() { return !!this.prop.invertValueAxis; }
    public get categoryScale() { return this.flipped ? this._yScale : this._xScale; }
    public get valueScale() { return this.flipped ? this._xScale : this._yScale; }

    public stackedDataKeys(key: string) { return this.prop.stackedData[key]; }

    // private use

    private createScale(x: boolean) {
        const size = x ? this.$geometry.width : this.$geometry.height;
        const func = this.flipped === x ? this.createValueScale : this.createCategoryScale;
        return func.call(this, size);
    }

    private createCategoryScale(size: number) {
        const [pt, pr, pb, pl] = this._paddings;
        const width = size - pl - pr;
        let n = (this.hasMultipleData ? this.data[Object.keys(this.data)[0]] : this.data).values.length;
        if (!this.prop.hasPadding) n -= 1;
        const gap = typeof this.prop.gap === "number" ? this.prop.gap : (width * 0.1 / n);
        const columnSizeWithGap = (width - gap) / n;
        this.columnWidth = columnSizeWithGap - gap;
        const padding = this.prop.hasPadding ? (columnSizeWithGap + gap) * 0.5 : 0;
        const domain: [number, number] = [padding, width - padding];
        return this._createScale_linear(true, this._cRange as any, domain);
    }

    private createValueScale(size: number) {
        const [pt, pr, pb, pl] = this._paddings;
        const width = size - pt - pb;
        return this._createScale_linear(
            false,
            this._vRange,
            this.inverted ? [0, width] : [width, 0],
        );
    }

    private getPadding(): [number, number, number, number] {
        const result = [0, 0, 0, 0] as [number, number, number, number];
        let p: number;
        if (p = this.prop.padding) {
            result.fill(p);
        }
        if (p = this.prop["padding-x"]) result[1] = result[3] = p;
        if (p = this.prop["padding-y"]) result[0] = result[2] = p;
        if (p = this.prop["padding-t"]) result[0] = p;
        if (p = this.prop["padding-r"]) result[1] = p;
        if (p = this.prop["padding-b"]) result[2] = p;
        if (p = this.prop["padding-l"]) result[3] = p;
        return result;
    }

    private offset = offset;
}

export function getGetter(vf: string | ((d: any, i: number) => any)) {
    return typeof vf === "string" ? (d: any) => d[vf] : vf;
}

export function parseData(elm: Component<ComponentOption>, data: any, h: DataHandler) {
    if (!h) h = createDataHandler(data);
    return {
        values: h.values(data).map((d, i) => ({
            pos: h.pos(d, i), value: h.max(d, i), minValue: h.min(d, i), data: d,
        })),
        raw: data,
    };
}

function createDataHandler(data: any): DataHandler {
    let values: (d: any) => number[];
    let v: any[];
    if (Array.isArray(data)) {
        values = d => d;
        v = data;
    } else {
        values = d => d["values"];
        v = data.values;
        if (!Array.isArray(v))
            throw new Error(`XYPlot is unable to handle the data. Please use a customized data handler.`);
    }
    const d = v[0];
    let pos = (d: any, i: number) => i;
    let min = (d: any, i: number) => 0;
    let max: (d: any, i: number) => number;
    if (typeof d === "number") {
        max = d => d;
    } else if (Array.isArray(d)) {
        if (d.length === 2 && typeof d[0] === "string") {
            max = d => d[1]; pos = d => d[0];
        } else {
            max = d => d[d.length - 1]; min = d => d[0];
        }
    } else {
        max = d => d.value;
    }
    return { values, min, max, pos };
}
