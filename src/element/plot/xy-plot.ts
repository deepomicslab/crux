import { groupBy, uniq } from "lodash";

import { GeometryValue } from "../../defs/geometry";
import { useTemplate } from "../../ext/decorator";
import { ElementDef } from "../../rendering/element-def";
import { max, min, minmax } from "../../utils/math";
import { ChartPaddingOptions, getPaddings } from "../chart/utils/option-padding";
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
    categories: ((d: any) => any[]) | null;
    values: (d: any) => any[];
    min: (d: any, i: number) => number;
    value: (d: any, i: number) => number;
    pos: (d: any, i: number) => any;
}

export interface XYPlotOption extends ComponentOption, ChartPaddingOptions {
    data: any[] | Record<string, any>;
    dataHandler: DataHandler | Record<string, DataHandler>;
    stackedData: Record<string, string[]>;
    discreteCategory: boolean;
    categoryRange: any[];
    valueRange: [number, number];
    valueUseLog: boolean;
    categoryUseLog: boolean;
    capToMinValue: boolean;
    gap: number;
    hasPadding: boolean;
    // layout
    flip: boolean;
    invertValueAxis: boolean;
}

@useTemplate(`
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
`)
export class XYPlot extends Component<XYPlotOption> {
    public data!: ParsedData | Record<string, ParsedData>;
    public hasMultipleData = false;
    public columnWidth!: number;
    public discreteCategory!: boolean;

    private _paddings!: [number, number, number, number];
    private _xScale: any;
    private _yScale: any;
    private _cRange!: any[];
    private _vRange!: [number, number];

    public defaultProp() {
        return {
            ...super.defaultProp(),
            hasPadding: true,
        };
    }

    public willRender() {
        const data = this.prop.data;
        let handler: Record<string, DataHandler>;
        const h_ = this.prop.dataHandler || {};
        if (typeof h_.value === "function" && typeof h_.pos === "function") {
            handler = { default: h_ as DataHandler };
        } else {
            handler = h_ as Record<string, DataHandler>;
        }
        if (data) {
            let allData: XYPlotPoint[];
            if (Array.isArray(data)) {
                this.data = parseData(this, data, handler.default);
                allData = this.data.values;
            } else if (typeof data === "object") {
                this.hasMultipleData = true;
                this.data = {};
                Object.keys(data).forEach(
                    k => (this.data[k] = parseData(this, data[k], handler[k] || handler.default)),
                );
                // all data
                allData = [];
                const keys = new Set(Object.keys(this.data));
                const stackedData = this.prop.stackedData;
                if (typeof stackedData === "object") {
                    Object.keys(stackedData).forEach(k => {
                        if (typeof k !== "string" || !(k in stackedData))
                            throw new Error(`${k} is not a valid data key.`);
                        const flatten: XYPlotPoint[] = stackedData[k]
                            .map(sd => {
                                keys.delete(sd);
                                return this.data[sd].values;
                            })
                            .flat();
                        const grouped = groupBy(flatten, "pos");
                        const gather = (pos: any) =>
                            grouped[pos].reduce((p, c) => ({ pos: p.pos, value: p.value + c.value, minValue: 0 }));
                        allData.push(...Object.keys(grouped).map(gather));
                    });
                }
                for (const e of keys.entries()) {
                    allData.push(...this.data[e[0]].values);
                }
            } else {
                throw new Error(`XYPlot: data supplied must be an array or an object.`);
            }
            this.discreteCategory =
                "discreteCategory" in this.prop
                    ? this.prop.discreteCategory
                    : allData.length > 0
                    ? typeof allData[0].pos === "string"
                    : false;
            this._cRange =
                this.prop.categoryRange ||
                (this.discreteCategory ? uniq(allData.map(d => d.pos)) : minmax(allData, d => d.pos));
            const minValue = min(allData, d => d.minValue)!;
            this._vRange = this.prop.valueRange || [
                minValue < 0 || this.prop.capToMinValue ? minValue : 0,
                max(allData, d => d.value),
            ];
        }
        this._paddings = getPaddings(this);
        this._xScale = this.createScale(true);
        this._yScale = this.createScale(false);
    }

    public handleChildren(children: ElementDef[]) {
        for (const c of children) {
            if (c.tag === "Legend") return;
            if ("opt" in c) {
                const props = c.opt.props;
                if (!("width" in props)) props.width = GeometryValue.fullSize;
                if (!("height" in props)) props.height = GeometryValue.fullSize;
            }
        }
        return children;
    }

    // API

    public get flipped() {
        return !!this.prop.flip;
    }
    public get inverted() {
        return !!this.prop.invertValueAxis;
    }
    public get categoryScale() {
        return this.flipped ? this._yScale : this._xScale;
    }
    public get valueScale() {
        return this.flipped ? this._xScale : this._yScale;
    }
    public get categories() {
        return this._cRange;
    }

    public stackedDataKeys(key: string) {
        return this.prop.stackedData[key];
    }

    // private use

    private createScale(x: boolean) {
        const size = x ? this.$geometry.width : this.$geometry.height;
        const func = this.flipped === x ? this.createValueScale : this.createCategoryScale;
        return func.call(this, size);
    }

    private createCategoryScale(size: number) {
        const [, pr, , pl] = this._paddings;
        const width = size - pl - pr;
        let n = (this.hasMultipleData ? this.data[Object.keys(this.data)[0]] : this.data).values.length;
        if (!this.prop.hasPadding) n -= 1;
        const gap = typeof this.prop.gap === "number" ? this.prop.gap : (width * 0.1) / n;
        const columnSizeWithGap = (width - gap) / n;
        this.columnWidth = columnSizeWithGap - gap;
        const padding = this.prop.hasPadding ? (columnSizeWithGap + gap) * 0.5 : 0;
        const domain: [number, number] = [padding, width - padding];

        if (this.discreteCategory) {
            const ticks = Array(n)
                .fill(null)
                .map((_, i) => i * columnSizeWithGap + domain[0]);
            return this._createScaleOrdinal(this._cRange, ticks);
        } else {
            const scale = this._createScale(
                this.prop.categoryUseLog ? "log" : "linear",
                true,
                this._cRange as any,
                domain,
            );
            return scale;
        }
    }

    private createValueScale(size: number) {
        const [pt, , pb] = this._paddings;
        const width = size - pt - pb;
        const scale = this._createScale(
            this.prop.valueUseLog ? "log" : "linear",
            false,
            this._vRange,
            this.inverted ? [0, width] : [width, 0],
        );
        return scale;
    }
}

export function getGetter(vf: string | ((d: any, i: number) => any)) {
    return typeof vf === "string" ? (d: any) => d[vf] : vf;
}

export function parseData(elm: Component<ComponentOption>, data: any, h: DataHandler) {
    h = h ? addDefaultsToDataHandler(h) : createDataHandler(data);
    let categories: any[] | null = null;
    if (h.categories) {
        categories = h.categories(data);
    }
    return {
        values: h.values(data).map((d, i) => ({
            pos: categories ? categories[i] : h.pos(d, i),
            value: h.value(d, i),
            minValue: h.min(d, i),
            data: d,
        })),
        raw: data,
    };
}

function addDefaultsToDataHandler(h: DataHandler) {
    if (!h.value) h.value = d => d.value;
    if (!h.min) h.min = d => 0;
    if (!h.pos) h.pos = (d, i) => i;
    if (!h.values) h.values = d => d;
    return h;
}

function createDataHandler(data: any): DataHandler {
    let values: (d: any) => number[] = d => d;
    let categories: ((d: any) => any[]) | null = null;
    let v: any[];
    if (Array.isArray(data)) {
        v = data;
    } else {
        values = d => d["values"];
        if ("categories" in data) {
            categories = d => d.categories;
        }
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
            max = d => d[1];
            pos = d => d[0];
        } else {
            max = d => d[d.length - 1];
            min = d => d[0];
        }
    } else {
        pos = d => d.pos;
        max = d => d.value;
    }
    return { categories, values, min, value: max, pos };
}
